/**
 *
 * Generate index module
 *
 * `generate` command do the following:
 *
 * - copy the directory `.uranio` from its root directory into the
 *   `node_modules` of the project where the command is run.
 *
 * - After parsing the types with `plutonio` it updates the copied typescript
 *   files.
 *
 * - It then build the updated `.uranio` files as a typescript project.
 *
 * @packageDocumentation
 */

import fs from 'fs';
import ray from 'r4y';
import plutonio from 'plutonio';
import {log} from '../log/index';
import * as utils from '../utils/index';
import * as exception from '../exception/index';
import * as common from '../common/index';
import * as t from '../types';

export async function generate(args: t.Arguments) {
  common.set_verbosity(args);
  const params = _resolve_generate_params(args);
  log.spinner.start();
  log.spinner.text(`Generating...`);
  await _copy_dot_uranio(params);
  await _update_dot_uranio(params);
  await _build_dot_uranio(params);
  log.spinner.stop();
  log.success(`Uranio successfully generated client`);
}

function _resolve_generate_params(args: t.Arguments): t.GenerateParams {
  const root_path = common.resolve_param_root(args);
  const tsconfig_path = _resolve_param_tsconfig_path(root_path, args);
  const yaml_params = common.read_yaml_params(root_path);
  let naming_convention = yaml_params.naming_convention;
  if (!naming_convention) {
    naming_convention = _resolve_param_naming_convention(args);
  }
  let database = yaml_params.database;
  if (!database) {
    database = _resolve_param_database(args);
  }
  return {
    database,
    naming_convention,
    root: root_path,
    tsconfig_path,
  };
}

function _resolve_param_tsconfig_path(
  root_path: string,
  args: t.Arguments
): string {
  if (args.flags && utils.valid.string(args.flags?.['tsconfig-path'])) {
    return args.flags['tsconfig-path'];
  }
  return `${root_path}/tsconfig.json`;
}

function _resolve_param_database(args: t.Arguments): t.Database {
  if (args.flags && utils.valid.string(args.flags?.['database'])) {
    const db = args.flags['database'];
    common.assert_database(db);
    return db;
  }
  return t.DATABASE.MONGODB;
}

function _resolve_param_naming_convention(
  args: t.Arguments
): t.NamingConvention {
  if (args.flags && utils.valid.string(args.flags?.['naming-convention'])) {
    const naming_convention = args.flags['naming-convention'];
    common.assert_naming_convention(naming_convention);
    return naming_convention;
  }
  return t.NAMING_CONVENTION.CAMEL_CASE;
}

async function _copy_dot_uranio(params: t.GenerateParams) {
  log.spinner.text(`Coping dot uranio...`);
  const dot_path = `${params.root}/node_modules/uranio/.uranio`;
  const destination_path = `${params.root}/node_modules/.uranio`;
  log.spinner.stop();
  await ray.spawn(`rm -rf ${destination_path}`);
  await ray.spawn(`cp -rf ${dot_path} ${destination_path}`);
  log.spinner.start();
  log.debug(`Copied dot uranio directory`);
}

async function _update_dot_uranio(params: t.GenerateParams) {
  log.spinner.text(`Updating dot uranio files...`);
  const dot_uranio_src_path = `${params.root}/node_modules/.uranio/src`;
  const uranio_extended_interfaces = _get_uranio_extended_interfaces(params);

  if (Object.entries(uranio_extended_interfaces).length < 1) {
    log.info(`No interface was found`);
    return;
  }

  log.trace(`Generating client...`);
  const client_text =
    params.database === t.DATABASE.MYSQL
      ? _generate_mysql_uranio_client_module_text(
          uranio_extended_interfaces,
          params.naming_convention
        )
      : _generate_mongodb_uranio_client_module_text(
          uranio_extended_interfaces,
          params.naming_convention
        );

  const uranio_client_path = `${dot_uranio_src_path}/client.ts`;
  fs.writeFileSync(uranio_client_path, client_text);
  log.debug(`Generated client`);

  log.trace(`Generating index...`);
  const index_text =
    params.database === t.DATABASE.MYSQL
      ? _generate_mysql_uranio_index_module_text()
      : _generate_mongodb_uranio_index_module_text();

  const uranio_index_path = `${dot_uranio_src_path}/index.ts`;
  fs.writeFileSync(uranio_index_path, index_text);
  log.debug(`Generated index`);

  log.trace(`Generating types...`);
  const types_text =
    params.database === t.DATABASE.MYSQL
      ? _generate_mysql_uranio_types_module_text(
          uranio_extended_interfaces,
          params.naming_convention
        )
      : _generate_mongodb_uranio_types_module_text(
          uranio_extended_interfaces,
          params.naming_convention
        );

  const uranio_types_path = `${dot_uranio_src_path}/types/index.ts`;
  fs.writeFileSync(uranio_types_path, types_text);
  log.debug(`Generated types`);

  log.debug(`Updated dot uranio files`);
}

async function _build_dot_uranio(params: t.GenerateParams) {
  log.spinner.text(`Transpiling dot uranio files...`);
  const copied_dot_uranio_tsconfig_path = `${params.root}/node_modules/.uranio/tsconfig.json`;
  // await ray.spawn(`yarn tsc --project ${copied_dot_uranio_tsconfig_path}`);
  await ray.spawn(`npx tsc --project ${copied_dot_uranio_tsconfig_path}`);
  log.debug(`Transpiled dot uranio files`);
}

function _resolve_tsconfig_path(params: t.GenerateParams) {
  if (utils.valid.string(params.tsconfig_path)) {
    return params.tsconfig_path;
  }
  return `${params.root}/tsconfig.json`;
}

function _get_uranio_extended_interfaces(params: t.GenerateParams) {
  const tsconfig_path = _resolve_tsconfig_path(params);
  const scanned = plutonio.scan(tsconfig_path);
  // log.trace(scanned);
  const uranio_extended_interfaces: plutonio.Interfaces = {};
  for (const [_source_path, source] of Object.entries(scanned)) {
    const interfaces = source.interfaces;
    const imports = source.imports;
    if (!interfaces || !imports) {
      continue;
    }
    let uranio_clause;
    for (const [_name, imp] of Object.entries(imports)) {
      if (imp.module === 'uranio') {
        uranio_clause = imp.clause;
        break;
      }
    }
    const atom_definition = `${uranio_clause}.atom`;
    for (const [name, inter] of Object.entries(interfaces)) {
      if (!inter.extends || !inter.extends.includes(atom_definition)) {
        continue;
      }
      if (name in uranio_extended_interfaces) {
        log.warn(
          `An Atom with the same name [${name}] already exists. Overriding...`
        );
      }
      uranio_extended_interfaces[name] = inter;
    }
  }
  // log.trace(uranio_extended_interfaces);
  _debug_interfaces(uranio_extended_interfaces);
  return uranio_extended_interfaces;
}

function _generate_mongodb_uranio_types_module_text(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  text += `/**\n`;
  text += ` *\n`;
  text += ` * [Auto-generated module by "uranio generate" command]\n`;
  text += ` *\n`;
  text += ` * Types index module\n`;
  text += ` *\n`;
  text += ` */\n`;
  text += `\n`;
  text += `import {mongodb_atom as atom, mongodb_id} from './atom';\n`;
  text += `export {atom, mongodb_id};\n`;
  text += `\n`;
  text += _generate_atom_name_type(interfaces, naming_convention);
  text += `\n`;
  return text;
}

function _generate_mysql_uranio_types_module_text(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  text += `/**\n`;
  text += ` *\n`;
  text += ` * [Auto-generated module by "uranio generate" command]\n`;
  text += ` *\n`;
  text += ` * Types index module\n`;
  text += ` *\n`;
  text += ` */\n`;
  text += `\n`;
  text += `import {mysql_atom as atom} from './atom';\n`;
  text += `export {atom};\n`;
  text += `\n`;
  text += _generate_atom_name_type(interfaces, naming_convention);
  text += `\n`;
  return text;
}

function _generate_mongodb_uranio_index_module_text() {
  let text = '';
  text += `/**\n`;
  text += ` *\n`;
  text += ` * [Auto-generated module by "uranio generate" command]\n`;
  text += ` *\n`;
  text += ` * Index module\n`;
  text += ` *\n`;
  text += ` */\n`;
  text += `\n`;
  text += `export * from './types/index';\n`;
  text += `\n`;
  text += `import {UranioMongoDBClient as MongoDBClient} from './client';\n`;
  text += `export {MongoDBClient};`;
  text += `\n`;
  return text;
}

function _generate_mysql_uranio_index_module_text() {
  let text = '';
  text += `/**\n`;
  text += ` *\n`;
  text += ` * [Auto-generated module by "uranio generate" command]\n`;
  text += ` *\n`;
  text += ` * Index module\n`;
  text += ` *\n`;
  text += ` */\n`;
  text += `\n`;
  text += `export * from './types/index';\n`;
  text += `\n`;
  text += `import {UranioMySQLClient as MySQLClient} from './client';\n`;
  text += `export {MySQLClient};`;
  text += `\n`;
  return text;
}

function _generate_mongodb_uranio_client_module_text(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  text += `/**\n`;
  text += ` *\n`;
  text += ` * [Auto-generated module by "uranio generate" command]\n`;
  text += ` *\n`;
  text += ` * Uranio MongoDBClient module\n`;
  text += ` *\n`;
  text += ` */\n`;
  text += `\n`;
  text += `import {MongoDBClient, MongoDBClientParams} from './client/mongodb';\n`;
  text += `import {MongoDBAtomClient} from './atom/mongodb';\n`;
  text += `import * as atom_types from './types/atom';\n`;
  text += `\n`;
  text += _generate_mongodb_interface_definitions(interfaces);
  text += _generate_mongodb_client(interfaces, naming_convention);
  text += `\n`;
  return text;
}

function _generate_mysql_uranio_client_module_text(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  text += `/**\n`;
  text += ` *\n`;
  text += ` * [Auto-generated module by "uranio generate" command]\n`;
  text += ` *\n`;
  text += ` * Uranio MySQLClient module\n`;
  text += ` *\n`;
  text += ` */\n`;
  text += `\n`;
  text += `import {MySQLClient, MySQLClientParams} from './client/mysql';\n`;
  text += `import {MySQLAtomClient} from './atom/mysql';\n`;
  text += `import * as atom_types from './types/atom';\n`;
  text += `\n`;
  text += _generate_mysql_interface_definitions(interfaces);
  text += _generate_mysql_client(interfaces, naming_convention);
  text += `\n`;
  return text;
}

function _generate_atom_name_type(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  text += `type ObjectValue<T> = T[keyof T];\n\n`;
  text += `export const ATOM_NAME = {\n`;
  for (const [name, _inter] of Object.entries(interfaces)) {
    let lc = _process_collection_name(name, naming_convention);
    text += `  ${lc.toUpperCase()}: '${lc}',\n`;
  }
  text += `} as const;\n\n`;
  text += `export type AtomName = ObjectValue<typeof ATOM_NAME>;\n`;
  return text;
}

function _generate_mongodb_client(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  text += `export class UranioMongoDBClient extends MongoDBClient{\n`;
  text += _generate_mongodb_client_attributes(interfaces, naming_convention);
  text += `  constructor(params: MongoDBClientParams) {\n`;
  text += `    super(params);\n`;
  text += _generate_mongodb_client_initialization(
    interfaces,
    naming_convention
  );
  text += `  }\n`;
  text += `}\n`;
  return text;
}

function _generate_mysql_client(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  text += `export class UranioMySQLClient extends MySQLClient{\n`;
  text += _generate_mysql_client_attributes(interfaces, naming_convention);
  text += `  constructor(params: MySQLClientParams) {\n`;
  text += `    super(params);\n`;
  text += _generate_mysql_client_initialization(interfaces, naming_convention);
  text += `  }\n`;
  text += `}\n`;
  return text;
}

function _resolve_primitve(prop: plutonio.TypeAttributes): string {
  switch (prop.primitive) {
    case plutonio.PRIMITIVE.UNRESOLVED: {
      if (prop.original.indexOf('.mongodb_id') !== -1) {
        return 'atom_types.mongodb_id';
      }
      return 'unknown';
    }
    case plutonio.PRIMITIVE.ENUM: {
      return _resolve_primitive_enum(prop);
    }
    case plutonio.PRIMITIVE.DATE: {
      return 'Date';
    }
    case plutonio.PRIMITIVE.ARRAY: {
      if (!prop.item) {
        return 'any[]';
      }
      const primitive_item = _resolve_primitve(prop.item);
      return `(${primitive_item})[]`;
    }
    case plutonio.PRIMITIVE.ANY:
    case plutonio.PRIMITIVE.BOOLEAN:
    case plutonio.PRIMITIVE.NULL:
    case plutonio.PRIMITIVE.NUMBER:
    case plutonio.PRIMITIVE.OBJECT:
    case plutonio.PRIMITIVE.STRING:
    case plutonio.PRIMITIVE.UNDEFINED: {
      return prop.primitive;
    }
    default: {
      throw new exception.UranioCLIException(
        `Invalid Plutonio primitive. Evaluating '${prop.primitive}'`
      );
    }
  }
}

function _resolve_primitive_enum(prop: plutonio.TypeAttributes): string {
  const primitives: (string | number)[] = [];
  if (!prop.values) {
    return 'unknown';
  }
  for (const value of prop.values) {
    switch (typeof value) {
      case 'string': {
        primitives.push(`"${value}"`);
        break;
      }
      case 'number': {
        primitives.push(value);
        break;
      }
    }
  }
  const joined_types = primitives.join(' | ');
  return joined_types;
}

function _generate_mongodb_interface_definitions(
  interfaces: plutonio.Interfaces
) {
  let text = '';
  for (const [name, inter] of Object.entries(interfaces)) {
    text += `interface ${name} extends atom_types.mongodb_atom {\n`;
    if (!inter.properties) {
      text += `}\n`;
      text += `\n`;
      continue;
    }
    for (const [prop_name, prop] of Object.entries(inter.properties)) {
      text += `  ${prop_name}: ${_resolve_primitve(prop)};\n`;
    }
    text += `}\n`;
    text += `\n`;
  }
  return text;
}

function _generate_mysql_interface_definitions(
  interfaces: plutonio.Interfaces
) {
  let text = '';
  for (const [name, inter] of Object.entries(interfaces)) {
    text += `interface ${name} extends atom_types.mysql_atom {\n`;
    if (!inter.properties) {
      text += `}\n`;
      text += `\n`;
      continue;
    }
    for (const [prop_name, prop] of Object.entries(inter.properties)) {
      text += `  ${prop_name}: ${_resolve_primitve(prop)};\n`;
    }
    text += `}\n`;
    text += `\n`;
  }
  return text;
}

function _generate_mongodb_client_attributes(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  for (const [name, _inter] of Object.entries(interfaces)) {
    let lc = _process_collection_name(name, naming_convention);
    text += `  public ${lc}: MongoDBAtomClient<${name}>;\n`;
  }
  return text;
}

function _generate_mongodb_client_initialization(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  for (const [name, _inter] of Object.entries(interfaces)) {
    let lc = _process_collection_name(name, naming_convention);
    // Different from MySQL since it pass `this.db` instead of `this`
    text += `    this.${lc} = new MongoDBAtomClient<${name}>(this.db, '${lc}');\n`;
  }
  return text;
}

function _generate_mysql_client_attributes(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  for (const [name, _inter] of Object.entries(interfaces)) {
    let lc = _process_collection_name(name, naming_convention);
    text += `  public ${lc}: MySQLAtomClient<${name}>;\n`;
  }
  return text;
}

function _generate_mysql_client_initialization(
  interfaces: plutonio.Interfaces,
  naming_convention: t.NamingConvention
) {
  let text = '';
  for (const [name, _inter] of Object.entries(interfaces)) {
    let lc = _process_collection_name(name, naming_convention);
    // Different from Mongo since it pass `this` instead of `this.db`
    text += `    this.${lc} = new MySQLAtomClient<${name}>(this, '${lc}');\n`;
  }
  return text;
}

function _process_collection_name(
  input: string,
  naming_convention: t.NamingConvention
): string {
  switch (naming_convention) {
    case 'camelCase': {
      return _pascal_to_camel(input);
    }
    case 'snake_case': {
      return _pascal_to_snake(input);
    }
    default: {
      return input;
    }
  }
}

function _debug_interfaces(uranio_extended_interfaces: plutonio.Interfaces) {
  for (let [key, _value] of Object.entries(uranio_extended_interfaces)) {
    log.info(`Processing Interface: ${key}`);
  }
}

function _pascal_to_snake(input: string): string {
  if (!input || !input[0] || typeof input !== 'string') {
    return input;
  }
  const result: string[] = [input[0].toLowerCase()];
  for (let i = 1; i < input.length; i++) {
    const char = input[i];
    if (!char) {
      continue;
    }
    if (char.toUpperCase() === char) {
      result.push('_', char.toLowerCase());
    } else {
      result.push(char);
    }
  }

  return result.join('');
}

function _pascal_to_camel(input: string): string {
  if (!input || !input[0] || typeof input !== 'string') {
    return input;
  }
  return input[0].toLowerCase() + input.slice(1);
}
