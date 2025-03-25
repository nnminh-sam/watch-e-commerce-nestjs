// TODO: fix logic of this function
export function generateSlug(str: string): string {
  return str.replace(' ', '-').toLowerCase();
}
