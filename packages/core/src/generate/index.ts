/**
 *
 * Generate index module
 *
 */

import plutonio from 'plutonio';

export function generate(tsconfig_path: string){
  const scanned = plutonio.scanner(tsconfig_path);
  return scanned;
}

