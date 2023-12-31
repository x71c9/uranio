/**
 *
 * Version index module
 *
 * @packageDocumentation
 */

import fs from 'fs';
import {log} from '../log/index';
import * as exception from '../exception/index';
import * as common from '../common/index';
import * as t from '../types';

export async function version(args: t.Arguments) {
  const root_path = common.resolve_param_root(args);
  const uranio_package_json_path = `${root_path}/node_modules/uranio/package.json`;
  if (!fs.existsSync(uranio_package_json_path)) {
    throw new exception.UranioCLIException(
      `Missing uranio package.json [${uranio_package_json_path}]`
    );
  }
  const data = fs.readFileSync(uranio_package_json_path, 'utf-8');
  const parsed_json = JSON.parse(data);
  log.info(`Uranio version: ${parsed_json.version}`);
}
