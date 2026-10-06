/**
 * What Jesse says in the store (owner's brief, 6 Oct 2026). He is the bloke behind the counter, not a tour guide: short, warm, Australian without
 * the costume, "brother" as his one signature. Almost every line is three to twelve words. Longer talk belongs to the wall, which is optional.
 *
 * These are a SCRIPT, not quotes: Jesse has not recorded or approved them yet. They show as captions until he has; nothing here states a fact
 * about the business. Lines are drawn from pools so a returning visitor does not hear the same opening every time.
 */
export const JESSE_LINES = {
  /** First thing he says to someone new. */
  opening: ["Hey brother, how ya going? Welcome in.", "Oi brother. Welcome in.", "How are ya, bro? Good to see ya.", "Hey brother. Come have a look."],
  /** First thing he says to someone he has seen before. */
  openingBack: ["Hey brother. Good to see ya again.", "Back again, brother. Good to see ya."],
  /** The question that hands over to the visitor. It stays on screen with the choices. */
  intent: ["What are we making today?", "What are you after, brother?", "What can I sort you out with?", "Where do you wanna start?"],
  /** When they choose to look around instead of shopping. */
  lookAround: ["Yeah brother, go for it. Have a look at the wall.", "No worries. Have a look around.", "Have a squiz at the wall, brother."],
} as const;

export type JesseLinePool = keyof typeof JESSE_LINES;

/** One line from a pool. Call it from an event or an effect, never while rendering: it is random on purpose. */
export function sayFrom(pool: JesseLinePool): string {
  const lines = JESSE_LINES[pool];
  return lines[Math.floor(Math.random() * lines.length)] ?? lines[0];
}
