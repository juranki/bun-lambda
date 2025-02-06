import { sep, join } from 'node:path';

export function sanitizePath(path: string): string {
  const segments = path.split(sep);
  const sanitizedSegments = segments.map((s) => s.replaceAll(/[^.a-zA-Z0-9_-]/g, ''));
  return join(...sanitizedSegments)
}
