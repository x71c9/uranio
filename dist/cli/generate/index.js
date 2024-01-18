"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const fs_1 = __importDefault(require("fs"));
const r4y_1 = __importDefault(require("r4y"));
const plutonio_1 = __importDefault(require("plutonio"));
const index_1 = require("../log/index");
const utils = __importStar(require("../utils/index"));
const exception = __importStar(require("../exception/index"));
const common = __importStar(require("../common/index"));
const t = __importStar(require("../types"));
async function generate(args) {
    var _a;
    const debug = ((_a = args.flags) === null || _a === void 0 ? void 0 : _a.verbose) === true;
    r4y_1.default.config.set({ debug, spinner: index_1.log.spinner });
    const params = _resolve_generate_params(args);
    index_1.log.spinner.start();
    index_1.log.spinner.text(`Generating...`);
    await _copy_dot_uranio(params);
    await _update_dot_uranio(params);
    await _build_dot_uranio(params);
    index_1.log.spinner.stop();
    index_1.log.success(`Uranio successfully generated client`);
}
exports.generate = generate;
function _resolve_generate_params(args) {
    const root_path = common.resolve_param_root(args);
    const tsconfig_path = _resolve_param_tsconfig_path(root_path, args);
    const database = _resolve_param_database(args);
    return {
        database,
        root: root_path,
        tsconfig_path,
    };
}
function _resolve_param_tsconfig_path(root_path, args) {
    var _a;
    if (args.flags && utils.valid.string((_a = args.flags) === null || _a === void 0 ? void 0 : _a['tsconfig-path'])) {
        return args.flags['tsconfig-path'];
    }
    return `${root_path}/tsconfig.json`;
}
function _resolve_param_database(args) {
    var _a;
    if (args.flags && utils.valid.string((_a = args.flags) === null || _a === void 0 ? void 0 : _a['database'])) {
        const db = args.flags['database'];
        _assert_database(db);
        return db;
    }
    return t.DATABASE.MONGODB;
}
function _assert_database(db) {
    if (!Object.values(t.DATABASE).includes(db)) {
        throw new exception.UranioCLIException(`Invalid database flag value. Possible value are` +
            ` [${Object.values(t.DATABASE)}]. Evaluating '${db}'`);
    }
}
async function _copy_dot_uranio(params) {
    index_1.log.spinner.text(`Coping dot uranio...`);
    const dot_path = `${params.root}/node_modules/uranio/.uranio`;
    const destination_path = `${params.root}/node_modules/.uranio`;
    index_1.log.spinner.stop();
    await r4y_1.default.spawn(`rm -rf ${destination_path}`);
    await r4y_1.default.spawn(`cp -rf ${dot_path} ${destination_path}`);
    index_1.log.spinner.start();
    index_1.log.debug(`Copied dot uranio directory`);
}
async function _update_dot_uranio(params) {
    index_1.log.spinner.text(`Updating dot uranio files...`);
    const dot_uranio_src_path = `${params.root}/node_modules/.uranio/src`;
    const uranio_extended_interfaces = _get_uranio_extended_interfaces(params);
    index_1.log.trace(`Generating client...`);
    const client_text = params.database === t.DATABASE.MYSQL
        ? _generate_mysql_uranio_client_module_text(uranio_extended_interfaces)
        : _generate_mongodb_uranio_client_module_text(uranio_extended_interfaces);
    const uranio_client_path = `${dot_uranio_src_path}/client.ts`;
    fs_1.default.writeFileSync(uranio_client_path, client_text);
    index_1.log.debug(`Generated client`);
    index_1.log.trace(`Generating index...`);
    const index_text = params.database === t.DATABASE.MYSQL
        ? _generate_mysql_uranio_index_module_text()
        : _generate_mongodb_uranio_index_module_text();
    const uranio_index_path = `${dot_uranio_src_path}/index.ts`;
    fs_1.default.writeFileSync(uranio_index_path, index_text);
    index_1.log.debug(`Generated index`);
    index_1.log.trace(`Generating types...`);
    const types_text = params.database === t.DATABASE.MYSQL
        ? _generate_mysql_uranio_types_module_text()
        : _generate_mongodb_uranio_types_module_text();
    const uranio_types_path = `${dot_uranio_src_path}/types/index.ts`;
    fs_1.default.writeFileSync(uranio_types_path, types_text);
    index_1.log.debug(`Generated types`);
    index_1.log.debug(`Updated dot uranio files`);
}
async function _build_dot_uranio(params) {
    index_1.log.spinner.text(`Transpiling dot uranio files...`);
    const copied_dot_uranio_tsconfig_path = `${params.root}/node_modules/.uranio/tsconfig.json`;
    await r4y_1.default.spawn(`yarn tsc --project ${copied_dot_uranio_tsconfig_path}`);
    index_1.log.debug(`Transpiled dot uranio files`);
}
function _resolve_tsconfig_path(params) {
    if (utils.valid.string(params.tsconfig_path)) {
        return params.tsconfig_path;
    }
    return `${params.root}/tsconfig.json`;
}
function _get_uranio_extended_interfaces(params) {
    const tsconfig_path = _resolve_tsconfig_path(params);
    const scanned = plutonio_1.default.scan(tsconfig_path);
    // log.trace(scanned);
    const uranio_extended_interfaces = {};
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
                index_1.log.warn(`An Atom with the same name [${name}] already exists. Overriding...`);
            }
            uranio_extended_interfaces[name] = inter;
        }
    }
    // log.trace(uranio_extended_interfaces);
    _debug_interfaces(uranio_extended_interfaces);
    return uranio_extended_interfaces;
}
function _generate_mongodb_uranio_types_module_text() {
    let text = '';
    text += `/**\n`;
    text += ` *\n`;
    text += ` * [Auto-generated module by "uranio generate" command]\n`;
    text += ` *\n`;
    text += ` * Types index module\n`;
    text += ` *\n`;
    text += ` */\n`;
    text += `\n`;
    text += `export * from './types/index';\n`;
    text += `\n`;
    text += `import {mongodb as atom} from './atom';\n`;
    text += `import {primary} from './atom';\n`;
    text += `export {atom, primary};\n`;
    text += `\n`;
    return text;
}
function _generate_mysql_uranio_types_module_text() {
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
    text += `import {primary} from './atom';\n`;
    text += `export {atom, primary};\n`;
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
function _generate_mongodb_uranio_client_module_text(interfaces) {
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
    text += `import {mongodb_atom} from './types/atom';\n`;
    text += `\n`;
    text += _generate_mongodb_interface_definitions(interfaces);
    text += _generate_mongodb_client(interfaces);
    text += `\n`;
    return text;
}
function _generate_mysql_uranio_client_module_text(interfaces) {
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
    text += `import {mysql_atom} from './types/atom';\n`;
    text += `\n`;
    text += _generate_mysql_interface_definitions(interfaces);
    text += _generate_mysql_client(interfaces);
    text += `\n`;
    return text;
}
function _generate_mongodb_client(interfaces) {
    let text = '';
    text += `export class UranioMongoDBClient extends MongoDBClient{\n`;
    text += _generate_mongodb_client_attributes(interfaces);
    text += `  constructor(params: MongoDBClientParams) {\n`;
    text += `    super(params);\n`;
    text += _generate_mongodb_client_initialization(interfaces);
    text += `  }\n`;
    text += `}\n`;
    return text;
}
function _generate_mysql_client(interfaces) {
    let text = '';
    text += `export class UranioMySQLClient extends MySQLClient{\n`;
    text += _generate_mysql_client_attributes(interfaces);
    text += `  constructor(params: MySQLClientParams) {\n`;
    text += `    super(params);\n`;
    text += _generate_mysql_client_initialization(interfaces);
    text += `  }\n`;
    text += `}\n`;
    return text;
}
function _generate_mongodb_interface_definitions(interfaces) {
    let text = '';
    for (const [name, inter] of Object.entries(interfaces)) {
        text += `interface ${name} extends mongodb_atom {\n`;
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
function _generate_mysql_interface_definitions(interfaces) {
    let text = '';
    for (const [name, inter] of Object.entries(interfaces)) {
        text += `interface ${name} extends mysql_atom {\n`;
        if (!inter.properties) {
            text += `}\n`;
            text += `\n`;
            continue;
        }
        for (const [prop_name, prop] of Object.entries(inter.properties)) {
            // if (prop.primitive === 'object' && prop.properties?.['___uranio']) {
            //   if (prop.properties['___uranio'].original === "__uranio: 'primary';") {
            //     const original = prop.original;
            //     const match = original.match(/<([^>]+)>/);
            //     if (match && match[1]) {
            //       text += `  ${prop_name}: ${match[1]};\n`;
            //       continue;
            //     }
            //     throw new exception.UranioCLIException(
            //       `Cannot resolve uranio.primary for attribute ${prop_name}`
            //     );
            //   }
            //   continue;
            // }
            text += `  ${prop_name}: ${prop.primitive};\n`;
        }
        text += `}\n`;
        text += `\n`;
    }
    return text;
}
function _generate_mongodb_client_attributes(interfaces) {
    let text = '';
    for (const [name, _inter] of Object.entries(interfaces)) {
        let lc = _first_letter_lowercase(name);
        text += `  public ${lc}: MongoDBAtomClient<${name}>;\n`;
    }
    return text;
}
function _generate_mongodb_client_initialization(interfaces) {
    let text = '';
    for (const [name, _inter] of Object.entries(interfaces)) {
        let lc = _first_letter_lowercase(name);
        // Different from MySQL since it pass `this.db` instead of `this`
        text += `    this.${lc} = new MongoDBAtomClient<${name}>(this.db, '${lc}');\n`;
    }
    return text;
}
function _generate_mysql_client_attributes(interfaces) {
    let text = '';
    for (const [name, _inter] of Object.entries(interfaces)) {
        let lc = _first_letter_lowercase(name);
        text += `  public ${lc}: MySQLAtomClient<${name}>;\n`;
    }
    return text;
}
function _generate_mysql_client_initialization(interfaces) {
    let text = '';
    for (const [name, _inter] of Object.entries(interfaces)) {
        let lc = _first_letter_lowercase(name);
        // Different from Mongo since it pass `this` instead of `this.db`
        text += `    this.${lc} = new MySQLAtomClient<${name}>(this, '${lc}');\n`;
    }
    return text;
}
function _first_letter_lowercase(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }
    return str.charAt(0).toLowerCase() + str.slice(1);
}
function _debug_interfaces(uranio_extended_interfaces) {
    for (let [key, _value] of Object.entries(uranio_extended_interfaces)) {
        index_1.log.info(`Processing Interface: ${key}`);
    }
}
//# sourceMappingURL=index.js.map