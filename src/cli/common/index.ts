/**
 *
 * Common index module
 *
 * @packageDocumentation
 */

import root from 'app-root-path';
import * as utils from '../utils/index';
import * as t from '../types';

export function resolve_param_root(args: t.Arguments): string {
  if (args.flags && utils.valid.string(args.flags?.['root'])) {
    return args.flags['root'];
  }
  const root_path = root.toString();
  return root_path;
}

