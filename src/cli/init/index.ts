/**
 *
 * Init index module
 *
 * `init` command do the following:
 *
 * - ask for the following data:
 *   - type of database: 'mongodb' | 'mysql'
 *   - type of naming convention: 'snake_case' | 'camelCase' | 'PascalCase'
 *
 * - create a yaml file in the root directory of the project with the selected
 *   data.
 *
 * @packageDocumentation
 */

import fs from 'fs';
import yaml from 'yaml';
import inquirer from 'inquirer';
import {log} from '../log/index';
import * as utils from '../utils/index';
import * as common from '../common/index';
import * as t from '../types';

export async function init(args: t.Arguments) {
  common.set_verbosity(args);
  const params = await _resolve_init_params(args);
  log.spinner.start();
  log.spinner.text(`Initializing...`);
  await _create_init_yaml(params);
  log.spinner.stop();
  log.success(`Uranio successfully initialized`);
}

async function _create_init_yaml(params: t.InitParams): Promise<void>{
  log.spinner.text(`Creating uranio.yml...`);
  const yaml_params = utils.object.deep_clone(params) as any;
  delete yaml_params.root;
  const yaml_string = yaml.stringify(yaml_params);
  const destination_path = `${params.root}/uranio.yml`;
  fs.writeFileSync(destination_path, yaml_string);
  log.spinner.stop();
  log.debug(`Copied dot uranio directory`);
}

async function _resolve_init_params(args: t.Arguments): Promise<t.InitParams> {
  const root = common.resolve_param_root(args);
  let database = _resolve_param_database(args);
  if (!database) {
    database = await _ask_for_database();
  }
  let naming_convention = _resolve_param_naming_convention(args);
  if (!naming_convention) {
    naming_convention = await _ask_for_naming_convention();
  }
  return {
    database,
    naming_convention,
    root
  };
}

async function _ask_for_database(): Promise<t.Database> {
  const response = await inquirer.prompt({
    type: 'list',
    name: 'database',
    message: 'Which database do you want to use?',
    choices: Object.values(t.DATABASE),
  });
  const database = response.database;
  common.assert_database(database);
  return database;
}

async function _ask_for_naming_convention(): Promise<t.NamingConvention>{
  const response = await inquirer.prompt({
    type: 'list',
    name: 'naming_convention',
    message: 'Which naming convention do you want to use?',
    choices: Object.values(t.NAMING_CONVENTION),
  });
  const naming_convention = response.naming_convention;
  common.assert_naming_convention(naming_convention);
  return naming_convention;
}

function _resolve_param_database(args: t.Arguments): t.Database | null {
  if (args.flags && utils.valid.string(args.flags?.['database'])) {
    const db = args.flags['database'];
    common.assert_database(db);
    return db;
  }
  return null;
}

function _resolve_param_naming_convention(
  args: t.Arguments
): t.NamingConvention | null {
  if (args.flags && utils.valid.string(args.flags?.['naming-convention'])) {
    const naming_convention = args.flags['naming-convention'];
    common.assert_naming_convention(naming_convention);
    return naming_convention;
  }
  return null;
}
