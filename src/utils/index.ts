import { camelCase } from 'lodash';

export function generateSlug(str: string): string {
  return str.replace(' ', '-').toLowerCase();
}
