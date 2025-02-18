export function generateSlug(str: string): string {
  return str.replace(' ', '-').toLowerCase();
}
