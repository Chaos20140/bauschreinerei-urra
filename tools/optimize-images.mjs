/**
 * Erzeugt responsive Varianten der Projektbilder und das Open-Graph-Bild.
 *
 * Hintergrund: Die Projektfotos liegen in 2500 px Breite vor, dargestellt
 * werden sie mit höchstens ~735 px. Ohne srcset lädt jedes Gerät die volle
 * Auflösung — rund 5,5 MB für sieben Bilder.
 *
 * Idempotent: vorhandene Varianten werden übersprungen. Nach dem Hinzufügen
 * neuer Projektbilder einfach erneut laufen lassen:
 *   npm run images
 */
import sharp from 'sharp';
import { readdirSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectDir = join(root, 'public', 'projekte');

/** Quellordner der Scroll-Sequenz (JPEG-Originale, nicht deployed). */
const FRAME_SETS = [
  { src: join(root, 'media-src', 'frames'), out: join(root, 'public', 'frames') },
  {
    src: join(root, 'media-src', 'frames-mobile'),
    out: join(root, 'public', 'frames-mobile'),
  },
];

/** Breiten, die das srcset in ProjektePage/ProjectDetailPage anbietet. */
const WIDTHS = [800, 1200, 1600];

/** Quelle für das Open-Graph-Vorschaubild (Social-Media-Karten). */
const OG_SOURCE = 'privatbau-haus.webp';

const isVariant = (name) => /-\d{3,4}\.webp$/.test(name);

async function buildVariants() {
  if (!existsSync(projectDir)) {
    console.error('public/projekte fehlt — nichts zu tun.');
    return;
  }

  const originals = readdirSync(projectDir).filter(
    (f) => extname(f) === '.webp' && !isVariant(f)
  );

  for (const file of originals) {
    const src = join(projectDir, file);
    const stem = basename(file, '.webp');
    const meta = await sharp(src).metadata();

    for (const width of WIDTHS) {
      // Nie hochskalieren — bringt nur Bytes, keine Qualität.
      if (meta.width && meta.width < width) continue;

      const out = join(projectDir, `${stem}-${width}.webp`);
      if (existsSync(out)) continue;

      await sharp(src)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(out);

      console.log(
        `${stem}-${width}.webp  ${(statSync(out).size / 1024).toFixed(0)} KB`
      );
    }
  }
}

async function buildOgImage() {
  const src = join(projectDir, OG_SOURCE);
  if (!existsSync(src)) {
    console.error(`OG-Quelle ${OG_SOURCE} fehlt — Open-Graph-Bild übersprungen.`);
    return;
  }

  const out = join(root, 'public', 'og-image.jpg');
  // JPEG statt WebP: manche Social-Media-Crawler (u. a. ältere WhatsApp- und
  // LinkedIn-Versionen) zeigen WebP-Vorschauen nicht zuverlässig an.
  await sharp(src)
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);

  console.log(`og-image.jpg  ${(statSync(out).size / 1024).toFixed(0)} KB`);
}

/**
 * Rechnet die Scroll-Sequenz auf Auslieferungsgröße herunter.
 *
 * WICHTIG — hier war schon einmal ein Fehler drin: Ein Zwischenstand hat die
 * Frames nach WebP konvertiert, weil das 44 % Bytes spart. Gemessen unter
 * 4-facher CPU-Drosselung dekodiert WebP aber 2,2-mal langsamer als JPEG
 * (70 Frames: 2899 ms statt 2328 ms) — und genau diese Dekodierzeit blockiert
 * den Main-Thread und lässt die Animation ruckeln. Die Sequenz ist
 * CPU-limitiert, nicht bandbreitenlimitiert.
 *
 * Deshalb: Baseline-JPEG (kein progressive, kein mozjpeg — beides dekodiert
 * langsamer) bei reduzierter Kantenlänge. Die Dekodierzeit skaliert mit der
 * Pixelzahl, das ist der wirksame Hebel. Gemessene Werte für 70 Frames:
 *
 *   Original  1920px  2328 ms Dekodierung
 *   WebP      1920px  2899 ms   ← war die Regression
 *   Baseline  1600px  1733 ms
 *   Baseline  1280px  1303 ms   ← gewählt
 *
 * Die Bilder sind Hintergrund hinter einem Kontrast-/Helligkeitsfilter und
 * werden formatfüllend skaliert — die reduzierte Auflösung fällt dort nicht
 * auf, die gewonnene Bildrate schon.
 */
// Mobile wird nicht verkleinert (Quelle ist bereits 720 px breit), dort wirkt
// allein die Qualitätsstufe — deshalb niedriger angesetzt als beim Desktop.
const FRAME_TARGETS = {
  frames: { width: 1600, quality: 74 },
  'frames-mobile': { width: 720, quality: 68 },
};

async function buildFrames() {
  for (const set of FRAME_SETS) {
    if (!existsSync(set.src)) {
      console.error(`${set.src} fehlt — Frames übersprungen.`);
      continue;
    }
    mkdirSync(set.out, { recursive: true });

    const name = basename(set.out);
    const target = FRAME_TARGETS[name];
    const files = readdirSync(set.src)
      .filter((f) => extname(f).toLowerCase() === '.jpg')
      .sort();

    let bytesIn = 0;
    let bytesOut = 0;
    let created = 0;

    for (const file of files) {
      const from = join(set.src, file);
      const to = join(set.out, file);
      bytesIn += statSync(from).size;

      if (!existsSync(to)) {
        await sharp(from)
          .resize({ width: target.width, withoutEnlargement: true })
          .jpeg({
            quality: target.quality,
            // progressive und mozjpeg bewusst AUS: beide erzeugen kleinere
            // Dateien, dekodieren aber messbar langsamer.
            progressive: false,
            mozjpeg: false,
            optimiseCoding: true,
            chromaSubsampling: '4:2:0',
          })
          .toFile(to);
        created++;
      }
      bytesOut += statSync(to).size;
    }

    console.log(
      `${name}: ${files.length} Frames @ ${target.width}px, ` +
        `${(bytesIn / 1024 / 1024).toFixed(1)} MB → ${(bytesOut / 1024 / 1024).toFixed(1)} MB ` +
        `(${created} neu erzeugt)`
    );
  }
}

await buildVariants();
await buildOgImage();
await buildFrames();
