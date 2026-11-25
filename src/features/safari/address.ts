const WEB_ADDRESS = /^(https?:\/\/)?(localhost|[\w-]+\.)+[a-z]{2,}([:/?#].*)?$/i;
const LOCALHOST = /^localhost([:/].*)?$/i;
const HAS_SCHEME = /^https?:\/\//i;

/** Turns what the user typed into a navigable URL, or a search URL for plain text. */
export function resolveAddress(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (HAS_SCHEME.test(value)) return value;
  if (WEB_ADDRESS.test(value) || LOCALHOST.test(value)) return `https://${value}`;
  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}
