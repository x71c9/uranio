/**
 *
 * Common index module
 *
 * @packageDocumentation
 */

import fs from 'fs';
import yaml from 'yaml';
import root from 'app-root-path';
import ray from 'r4y';
import {log} from '../log/index';
import * as utils from '../utils/index';
import * as exception from '../exception/index';
import * as t from '../types';

export function read_yaml_params(root_path: string): t.YamlParams {
  const yaml_path = `${root_path}/uranio.yml`;
  if (!fs.existsSync(yaml_path)) {
    throw new exception.UranioCLIException(
      `Missing uranio.yml file. Run 'uranio init' in order to create one`
    );
  }
  const data = fs.readFileSync(yaml_path, 'utf-8');
  const yaml_params = yaml.parse(data);
  _assert_yaml_params(yaml_params);
  return yaml_params;
}

export function set_verbosity(args: t.Arguments) {
  const debug = args.flags?.verbose === true;
  ray.config.set({debug, spinner: log.spinner});
}

export function resolve_param_root(args: t.Arguments): string {
  if (args.flags && utils.valid.string(args.flags?.['root'])) {
    return args.flags['root'];
  }
  const root_path = root.toString();
  return root_path;
}

export function assert_database(db: unknown): asserts db is t.Database {
  if (!Object.values(t.DATABASE).includes(db as any)) {
    throw new exception.UranioCLIException(
      `Invalid database flag value. Possible value are` +
        ` [${Object.values(t.DATABASE)}]. Evaluating '${db}'`
    );
  }
}

export function assert_naming_convention(
  naming_convention: unknown
): asserts naming_convention is t.NamingConvention {
  if (!Object.values(t.NAMING_CONVENTION).includes(naming_convention as any)) {
    throw new exception.UranioCLIException(
      `Invalid database flag value. Possible value are` +
        ` [${Object.values(
          t.NAMING_CONVENTION
        )}]. Evaluating '${naming_convention}'`
    );
  }
}

const yaml_params_keys: (keyof t.YamlParams)[] = [
  'database',
  'naming_convention',
];
const yaml_params_values = {
  database: Object.values(t.DATABASE),
  naming_convention: Object.values(t.NAMING_CONVENTION),
};
export function _assert_yaml_params(
  params: unknown
): asserts params is t.YamlParams {
  if (!params || typeof params !== 'object') {
    throw new exception.UranioCLIException(
      `Invalid Yaml Params. Cannot read uranio.yml`
    );
  }
  for (let [key, value] of Object.entries(params)) {
    if (!yaml_params_keys.includes(key as any)) {
      throw new exception.UranioCLIException(
        `Invalid Yaml Params key. Only the following are allowed:` +
          ` [${yaml_params_keys}]. Evaluating '${key}'`
      );
    }
    if (!(yaml_params_values as any)[key].includes(value)) {
      throw new exception.UranioCLIException(
        `Invalid Yaml Param value for key '${key}'. Only the following are` +
          ` allowed: [${
            (yaml_params_values as any)[key]
          }]. Evaluating '${value}'`
      );
    }
  }
}
