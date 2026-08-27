// Plausibilitätsprüfungen für die öffentlichen Formulare.
//
// Grundhaltung: Eine echte Anfrage darf NIE verlorengehen. Deshalb zwei Stufen:
//
//   1. Abweisen (422) nur bei Eingaben, die erkennbar keine echte Anfrage sein
//      können — Markup, Adressen im Namensfeld, offensichtlicher Tastatur-Müll.
//   2. Nur markieren bei allem, was lediglich verdächtig wirkt. Die Anfrage
//      wird normal gespeichert; die Benachrichtigung trägt einen Hinweis. Der
//      Betrieb entscheidet selbst.
//
// Bewusst KEINE Wortlisten für "Spam-Begriffe": Sie altern schlecht, treffen
// Falsches ("Kredit" kann in einer echten Bauanfrage vorkommen) und lassen sich
// trivial umgehen. Struktur schlägt Wortliste.

/** Zählt Wörter (Folgen ohne Leerraum). */
export function wortAnzahl(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Anzahl der Links im Text — der verlässlichste Spam-Hinweis. */
export function linkAnzahl(text: string): number {
  const treffer = text.match(/https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|ru|cn|top|xyz|info|biz)\b/gi);
  return treffer ? treffer.length : 0;
}

/**
 * Wirkt der Name wie ein Name?
 *
 * Bewusst großzügig: Namen sind weltweit sehr verschieden — „Ng", „Ø", „D'Angelo"
 * und „Đorđević" sind echt. Geprüft wird deshalb nur, was ein Name sicher NICHT
 * ist: Markup, Web- oder Mailadressen, reine Ziffern, ein einziges wiederholtes
 * Zeichen ("aaaaaa") oder gar kein Buchstabe.
 */
export function nameUnbrauchbar(name: string): boolean {
  const s = name.trim();
  if (s.length < 2) return true;
  // Kein einziger Buchstabe (egal welches Alphabet)
  if (!/\p{L}/u.test(s)) return true;
  // Markup oder Adressen gehören nicht in ein Namensfeld
  if (/[<>]/.test(s)) return true;
  if (/https?:\/\/|www\./i.test(s)) return true;
  if (/@/.test(s)) return true;
  // Ein einziges Zeichen wiederholt ("aaaa", "....")
  const ohneLeer = s.replace(/\s/g, "");
  if (ohneLeer.length >= 4 && new Set(ohneLeer.toLowerCase()).size === 1) return true;
  return false;
}

/**
 * Strengere E-Mail-Prüfung als das grobe Muster.
 *
 * Fängt die Fälle, die technisch durchrutschen, aber nie zustellbar sind:
 * doppelte Punkte, Punkt am Anfang/Ende, fehlende Endung, zu kurze Endung,
 * Leerzeichen. Eine Zustellbarkeitsprüfung ist das nicht — die ginge nur
 * durch tatsächlichen Versand.
 */
export function emailUnbrauchbar(email: string): boolean {
  const s = email.trim();
  if (s.length < 6 || s.length > 200) return true;
  if (/\s/.test(s)) return true;

  const teile = s.split("@");
  if (teile.length !== 2) return true;
  const [lokal, domain] = teile;

  if (!lokal || lokal.length > 64) return true;
  if (lokal.startsWith(".") || lokal.endsWith(".") || lokal.includes("..")) return true;

  if (!domain || domain.length > 255) return true;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return true;
  if (domain.startsWith("-") || domain.endsWith("-")) return true;

  const punkte = domain.split(".");
  if (punkte.length < 2) return true;
  const endung = punkte[punkte.length - 1];
  // Endungen sind mindestens zwei Buchstaben und enthalten keine Ziffern.
  if (!/^\p{L}{2,}$/u.test(endung)) return true;
  // Jedes Domain-Teilstück muss aus erlaubten Zeichen bestehen.
  if (!punkte.every((t) => /^[\p{L}\p{N}-]+$/u.test(t))) return true;

  return false;
}

export type Verdacht = {
  /** true = die Anfrage wirkt automatisiert. Sie wird trotzdem gespeichert. */
  verdaechtig: boolean;
  /** Kurze, lesbare Begründungen für die Benachrichtigung. */
  gruende: string[];
};

/**
 * Bewertet eine Nachricht, ohne sie abzulehnen.
 *
 * Alles hier ist ein Hinweis, kein Beweis — deshalb führt nichts davon zu
 * einer Abweisung. Der Betrieb sieht den Hinweis in der Mail und entscheidet.
 */
export function pruefeVerdacht(name: string, message: string): Verdacht {
  const gruende: string[] = [];

  const links = linkAnzahl(message);
  if (links >= 3) gruende.push(`enthält ${links} Links`);

  // Schreien: viele Großbuchstaben bei ausreichend langem Text
  const buchstaben = message.replace(/[^\p{L}]/gu, "");
  if (buchstaben.length >= 30) {
    const gross = message.replace(/[^\p{Lu}]/gu, "").length;
    if (gross / buchstaben.length > 0.6) gruende.push("fast durchgehend Großbuchstaben");
  }

  // Sehr lange Nachricht ohne jeden Zeilenumbruch wirkt maschinell
  if (message.length > 1500 && !message.includes("\n")) {
    gruende.push("sehr langer Text ohne Absätze");
  }

  // Dasselbe Zeichen sehr oft hintereinander
  if (/(.)\1{9,}/u.test(message)) gruende.push("auffällige Zeichenwiederholung");

  // Name taucht wörtlich in der Nachricht als einziger Inhalt auf
  if (message.trim().toLowerCase() === name.trim().toLowerCase()) {
    gruende.push("Nachricht entspricht nur dem Namen");
  }

  return { verdaechtig: gruende.length > 0, gruende };
}
