"use strict";
/**
 *
 * Generate index module
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
const index_1 = require("./log/index");
const utils = __importStar(require("../utils/index"));
const debug = (process.env.NODE_ENV === 'dev');
r4y_1.default.config.set({ debug, spinner: index_1.log.spinner });
async function generate(params) {
    index_1.log.spinner.start();
    index_1.log.spinner.text(`Generating...`);
    await _copy_dot_uranio(params);
    await _update_dot_uranio(params);
    await _build_dot_uranio(params);
    index_1.log.spinner.stop();
    index_1.log.success(`Uranio successfully generated client`);
}
exports.generate = generate;
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
    const uranio_extended_interfaces = _get_uranio_extended_interfaces(params);
    const text = _generate_uranio_client_module_text(uranio_extended_interfaces);
    const uranio_client_path = `${params.root}/node_modules/.uranio/src/uranio-client.ts`;
    fs_1.default.writeFileSync(uranio_client_path, text);
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
    return uranio_extended_interfaces;
}
function _generate_uranio_client_module_text(interfaces) {
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
function _generate_interface_definitions(interfaces) {
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
function _generate_client_class_attributes(interfaces) {
    let text = '';
    for (const [name, _inter] of Object.entries(interfaces)) {
        let lc = _first_letter_lowercase(name);
        text += `  public ${lc}: AtomClient<${name}>;\n`;
    }
    return text;
}
function _generate_client_initialization(interfaces) {
    let text = '';
    for (const [name, _inter] of Object.entries(interfaces)) {
        let lc = _first_letter_lowercase(name);
        text += `    this.${lc} = new AtomClient<${name}>(this.db, '${lc}');\n`;
    }
    return text;
}
function _first_letter_lowercase(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }
    return str.charAt(0).toLowerCase() + str.slice(1);
}
//# sourceMappingURL=index.js.map