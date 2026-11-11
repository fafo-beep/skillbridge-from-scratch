import { randomInt } from "node:crypto";

// Verification codes for credit recommendations. Sixteen characters from
// an alphabet without look-alikes (no 0, O, 1, I, L), shown in groups of
// four: about 80 bits, so a code cannot be guessed, and lookups are rate
// limited besides. Stored and compared in the printed form.

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function newVerifyCode(): string {
  let raw = "";
  for (let i = 0; i < 16; i++) raw += ALPHABET[randomInt(ALPHABET.length)];
  return raw.match(/.{4}/g)!.join("-");
}

// Accepts what a person types: any case, spaces or missing hyphens.
export function normalizeVerifyCode(input: string): string | null {
  const raw = input.toUpperCase().replace(/[^A-Z2-9]/g, "");
  if (raw.length !== 16 || [...raw].some((c) => !ALPHABET.includes(c))) return null;
  return raw.match(/.{4}/g)!.join("-");
}
