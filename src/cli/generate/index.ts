/**
 *
 * Generate index module
 *
 * @packageDocumentation
 */

import fs from 'fs';
import ray from 'r4y';
import plutonio from 'plutonio';
import {log} from '../log/index';
import * as utils from '../utils/index';
import * as common from '../common/index';
import * as t from '../types';

type GenerateParams = {
  root: string;
  tsconfig_path?: string;
};

export async function generate(args: t.Arguments) {
  const debug = args.flags?.verbose === true;
  ray.config.set({debug, spinner: log.spinner});
  const params = _resolve_generate_params(args);
  log.spinner.start();
  log.spinner.text(`Generating...`);
  await _copy_dot_uranio(params);
  await _update_dot_uranio(params);
  await _build_dot_uranio(params);
  log.spinner.stop();
  log.success(`Uranio successfully generated client`);
}

function _resolve_generate_params(args: t.Arguments): GenerateParams {
  const root_path = common.resolve_param_root(args);
  const tsconfig_path = _resolve_param_tsconfig_path(root_path, args);
  return {
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

async function _copy_dot_uranio(params: GenerateParams) {
  log.spinner.text(`Coping dot uranio...`);
  const dot_path = `${params.root}/node_modules/uranio/.uranio`;
  const destination_path = `${params.root}/node_modules/.uranio`;
  log.spinner.stop();
  await ray.spawn(`rm -rf ${destination_path}`);
  await ray.spawn(`cp -rf ${dot_path} ${destination_path}`);
  log.spinner.start();
  log.debug(`Copied dot uranio directory`);
}

async function _update_dot_uranio(params: GenerateParams) {
  log.spinner.text(`Updating dot uranio files...`);
  const uranio_extended_interfaces = _get_uranio_extended_interfaces(params);
  const text = _generate_uranio_client_module_text(uranio_extended_interfaces);
  const uranio_client_path = `${params.root}/node_modules/.uranio/src/uranio-client.ts`;
  fs.writeFileSync(uranio_client_path, text);
  log.debug(`Updated dot uranio files`);
}

async function _build_dot_uranio(params: GenerateParams) {
  log.spinner.text(`Transpiling dot uranio files...`);
  const copied_dot_uranio_tsconfig_path = `${params.root}/node_modules/.uranio/tsconfig.json`;
  await ray.spawn(`yarn tsc --project ${copied_dot_uranio_tsconfig_path}`);
  log.debug(`Transpiled dot uranio files`);
}

function _resolve_tsconfig_path(params: GenerateParams) {
  if (utils.valid.string(params.tsconfig_path)) {
    return params.tsconfig_path;
  }
  return `${params.root}/tsconfig.json`;
}

function _get_uranio_extended_interfaces(params: GenerateParams) {
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
  return uranio_extended_interfaces;
}

function _generate_uranio_client_module_text(interfaces: plutonio.Interfaces) {
  let text = '';
  text += `/**\n`;
  text += ` *\n`;
  text += ` * [Auto-generated module by "uranio generate" command]\n`;
  text += ` *\n`;
  text += ` * UranioClient module\n`;
  text += ` *\n`;
  text += ` */\n`;
  text += `\n`;
  text += `import {Client, ClientParams} from './client';\n`;
  text += `import {AtomClient} from './atom';\n`;
  text += `import {atom} from './types';\n`;
  text += `\n`;
  text += _generate_interface_definitions(interfaces);
  text += `export class UranioClient extends Client{\n`;
  text += _generate_client_class_attributes(interfaces);
  text += `  constructor(params: ClientParams) {\n`;
  text += `    super(params);\n`;
  text += _generate_client_initialization(interfaces);
  text += `  }\n`;
  text += `}\n`;
  return text;
}

function _generate_interface_definitions(interfaces: plutonio.Interfaces) {
  let text = '';
  for (const [name, inter] of Object.entries(interfaces)) {
    text += `interface ${name} extends atom {\n`;
    if (!inter.properties) {
      text += `}\n`;
      text += `\n`;
      continue;
    }
    for (const [prop_name, prop] of Object.entries(inter.properties)) {
      text += `  ${prop_name}: ${prop.primitive};\n`;
    }
    text += `}\n`;
    text += `\n`;
  }
  return text;
}

function _generate_client_class_attributes(interfaces: plutonio.Interfaces) {
  let text = '';
  for (const [name, _inter] of Object.entries(interfaces)) {
    let lc = _first_letter_lowercase(name);
    text += `  public ${lc}: AtomClient<${name}>;\n`;
  }
  return text;
}

function _generate_client_initialization(interfaces: plutonio.Interfaces) {
  let text = '';
  for (const [name, _inter] of Object.entries(interfaces)) {
    let lc = _first_letter_lowercase(name);
    text += `    this.${lc} = new AtomClient<${name}>(this.db, '${lc}');\n`;
  }
  return text;
}

function _first_letter_lowercase(str: string): string {
  if (typeof str !== 'string' || str.length === 0) {
    return str;
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}
