/**
 *
 * Config module
 *
 * @packageDocumentation
 *
 */

import ion from 'i0n';
import {Weights, DeepPartial} from 'w3i';
import * as types from '../types/config';
import {log} from '../log/index';

export const weights = new Weights<types.Config>({
  logLevel: 'TRACE',
  spinner: log.spinner,
});

export function set(params: DeepPartial<types.Config>): void {
  /**
   * Spinner contains methods, therefore cannot be cloned by weights.set,
   * otherwise it is distroyed by JSON.stringify when cloning.
   */
  if (params.spinner) {
    log.spinner = params.spinner as types.Config['spinner'];
  }
  /**
   * It must be also deleted from the params otherwise it is been deleted since
   * it is a reference
   */
  delete params.spinner;
  weights.set(params);
  if (params.logLevel) {
    log.params.log_level = ion.LOG_LEVEL[params.logLevel as keyof typeof ion.LOG_LEVEL];
  }
}
