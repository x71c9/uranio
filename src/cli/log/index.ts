/**
 *
 * Log index module
 *
 * @packageDocumentation
 *
 */

import ion from 'i0n';
export const log:ReturnType<typeof ion.create> = ion.create({
  log_level: ion.LOG_LEVEL.TRACE
});
