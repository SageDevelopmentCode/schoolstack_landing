/**
 * Pure helpers for the handwritten founder letter: content checks, the short link, and when it was mailed.
 * Shared by the plan validator test, the admin letter card and the funnel.
 */
import { countWords, STOCK_PHRASES } from "@/lib/admin-crm/outreach-email";
import type { DemoOutreachTouch } from "@/lib/admin-crm/demo-outreach-types";
import { LETTER_WORD_RANGE, type OutreachLetter, type OutreachPlan } from "@/data/outreach/types";

/** Phrases that make a letter read like a mail-merge (on top of the email STOCK_PHRASES). */
export const LETTER_STOCK_PHRASES = [
  "dear founder",
  "dear sir",
  "to whom it may concern",
  "i hope this letter finds you",
  "i hope this note finds you",
  "i wanted to reach out",
  "reaching out",
  "innovative",
  "revolutionize",
  "cutting-edge",
  "seamless",
  "solution",
  "platform",
  // Over-familiar lines that make a cold letter read as forced.
  "felt very familiar",
  "could have come from us",
  "says you were right",
  "stuck with me",
  "stayed with me",
  "allowed to be kids",
  "takes real nerve",
];

export const STICKY_NOTE_MAX_WORDS = 15;
export const POSTSCRIPT_MAX_WORDS = 35;

/** `name-abcd`: lowercase letters, digits and hyphens, ending in a 4+ character random part. */
export const LETTER_SHORT_CODE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-z0-9]{4,}$/;

/** The letter's text as the founder reads it: body plus P.S. */
export function letterText(letter: Pick<OutreachLetter, "body" | "postscript">): string {
  return letter.postscript ? `${letter.body.trim()}\n\nP.S. ${letter.postscript.trim()}` : letter.body.trim();
}

/** `trymudkitchen.com/hi/<code>` as printed under the QR (no scheme, so it's easy to type). */
export function letterShortUrl(shortCode: string, siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/hi/${shortCode}`;
}

export function letterShortUrlLabel(shortCode: string, siteUrl: string): string {
  return letterShortUrl(shortCode, siteUrl).replace(/^https?:\/\/(www\.)?/, "");
}

/** Problems with a plan's letter. Empty when it is ready to copy out by hand. */
export function letterProblems(plan: Pick<OutreachPlan, "letter" | "snapshot">): string[] {
  const letter = plan.letter;
  if (!letter) return [];
  const problems: string[] = [];
  const body = letter.body.trim();
  const words = countWords(body);
  const [min, max] = LETTER_WORD_RANGE;

  if (!plan.snapshot) problems.push("The QR card opens the snapshot, so the plan needs one.");
  if (!body.startsWith(`Hi ${letter.founder.firstName},`)) problems.push(`Start with "Hi ${letter.founder.firstName},".`);
  if (!body.endsWith("Julius")) problems.push('Sign off "Julius".');
  if (words < min || words > max) problems.push(`${words} words; a letter that fits one card is ${min}–${max}.`);

  const all = `${letterText(letter)}\n${letter.stickyNote}`;
  if (/https?:\/\/|www\.|\.com\b/i.test(all)) problems.push("No links in the letter: the QR card carries the link.");
  if (/\{[^}\n]*\}/.test(all)) problems.push("Leftover {placeholder} in the letter.");
  if (all.includes("!")) problems.push("No exclamation marks.");

  const lower = all.toLowerCase();
  const stock = [...STOCK_PHRASES, ...LETTER_STOCK_PHRASES].filter((phrase) => lower.includes(phrase));
  if (stock.length > 0) problems.push(`Reads as templated: "${stock.join('", "')}".`);

  const postscript = letter.postscript?.trim() ?? "";
  if (!postscript) problems.push("Add a P.S. that points to the card (their demo and snapshot).");
  else {
    if (!/\bcard\b/i.test(postscript)) problems.push("The P.S. should point to the card in the envelope.");
    if (countWords(postscript) > POSTSCRIPT_MAX_WORDS) problems.push(`P.S. is ${countWords(postscript)} words; keep it to ${POSTSCRIPT_MAX_WORDS}.`);
  }

  // The letter is about people; the product can stay unnamed (the card names it). Never more than once.
  const mudkitchen = (letterText(letter).match(/MudKitchen/g) ?? []).length;
  if (mudkitchen > 1) problems.push(`Name MudKitchen at most once in the letter (found ${mudkitchen}).`);
  if (!letterText(letter).includes("Sage Field")) problems.push("Say who you are: mention Sage Field.");

  if (countWords(letter.stickyNote) > STICKY_NOTE_MAX_WORDS) {
    problems.push(`Sticky note is ${countWords(letter.stickyNote)} words; keep it to ${STICKY_NOTE_MAX_WORDS}.`);
  }
  if (!LETTER_SHORT_CODE_RE.test(letter.shortCode)) problems.push(`Short code "${letter.shortCode}" should look like "athena-k7p2".`);

  if (letter.founderFacts.length === 0) problems.push("Add at least one founder fact.");
  if (!letter.founderFacts.some((f) => f.fact === letter.hook)) problems.push("The hook must be one of the founder facts, word for word.");
  for (const fact of letter.founderFacts) {
    if (!/^https:\/\//.test(fact.url)) problems.push(`Founder fact without an https source: ${fact.fact}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fact.readOn)) problems.push(`Founder fact without a read date: ${fact.fact}`);
  }
  if (!/^https:\/\//.test(letter.founder.url)) problems.push("Founder name needs an https source.");
  if (letter.mailTo) {
    if (letter.mailTo.lines.length < 2) problems.push("Mailing address needs at least a street line and a city line.");
    // The card prints mailTo.lines as the whole envelope, so it starts with who it's to, not the street.
    else if (/^(\d|p\.?\s*o\.?\s*box\b|c\/o\b)/i.test(letter.mailTo.lines[0].trim())) {
      problems.push("Mailing address should be the whole envelope: start with the recipient (and school), then street and city.");
    }
    if (!/^https:\/\//.test(letter.mailTo.url)) problems.push("Mailing address needs the https page it was published on.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(letter.writtenOn)) problems.push("writtenOn must be YYYY-MM-DD.");
  if (!letter.shortSchoolName.trim() || letter.shortSchoolName.length > 24) problems.push("shortSchoolName: the school as the founder says it, under 24 characters.");

  return problems;
}

/** True when the letter is written but no published business address has been found yet. */
export function letterNeedsAddress(letter: Pick<OutreachLetter, "mailTo">): boolean {
  return letter.mailTo === null;
}

/** True when a touch logs the letter going in the mail. */
export function isLetterTouch(touch: Pick<DemoOutreachTouch, "channel" | "direction">): boolean {
  return touch.channel === "mail" && touch.direction === "outbound";
}

/** When the letter was mailed (earliest outbound mail touch), or null. */
export function letterMailedAt(touches: Pick<DemoOutreachTouch, "channel" | "direction" | "occurredAt">[]): string | null {
  const dates = touches.filter(isLetterTouch).map((t) => t.occurredAt).sort();
  return dates[0] ?? null;
}

