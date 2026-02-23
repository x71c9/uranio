"use strict";
/**
 *
 * Init index module
 *
 * `init` command do the following:
 *
 * - ask for the following data:
 *   - type of database: 'mongodb' | 'mysql' | 'postgresql'
 *   - type of naming convention: 'snake_case' | 'camelCase' | 'PascalCase'
 *
 * - create a yaml file in the root directory of the project with the selected
 *   data.
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const inquirer_1 = __importDefault(require("inquirer"));
const index_1 = require("../log/index");
const utils = __importStar(require("../utils/index"));
const common = __importStar(require("../common/index"));
const t = __importStar(require("../types"));
async function init(args) {
    common.set_verbosity(args);
    const params = await _resolve_init_params(args);
    index_1.log.spinner.start();
    index_1.log.spinner.text(`Initializing...`);
    await _create_init_yaml(params);
    index_1.log.spinner.stop();
    index_1.log.success(`Uranio successfully initialized`);
}
async function _create_init_yaml(params) {
    index_1.log.spinner.text(`Creating uranio.yml...`);
    const yaml_params = utils.object.deep_clone(params);
    delete yaml_params.root;
    const yaml_string = yaml_1.default.stringify(yaml_params);
    const destination_path = `${params.root}/uranio.yml`;
    fs_1.default.writeFileSync(destination_path, yaml_string);
    index_1.log.spinner.stop();
    index_1.log.debug(`Copied dot uranio directory`);
}
async function _resolve_init_params(args) {
    const root = await common.resolve_param_root(args);
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
async function _ask_for_database() {
    const response = await inquirer_1.default.prompt({
        type: 'select',
        name: 'database',
        message: 'Which database do you want to use?',
        choices: Object.values(t.DATABASE),
    });
    const database = response.database;
    common.assert_database(database);
    return database;
}
async function _ask_for_naming_convention() {
    const response = await inquirer_1.default.prompt({
        type: 'select',
        name: 'naming_convention',
        message: 'Which naming convention do you want to use?',
        choices: Object.values(t.NAMING_CONVENTION),
    });
    const naming_convention = response.naming_convention;
    common.assert_naming_convention(naming_convention);
    return naming_convention;
}
function _resolve_param_database(args) {
    var _a;
    if (args.flags && utils.valid.string((_a = args.flags) === null || _a === void 0 ? void 0 : _a['database'])) {
        const db = args.flags['database'];
        common.assert_database(db);
        return db;
    }
    return null;
}
function _resolve_param_naming_convention(args) {
    var _a;
    if (args.flags && utils.valid.string((_a = args.flags) === null || _a === void 0 ? void 0 : _a['naming-convention'])) {
        const naming_convention = args.flags['naming-convention'];
        common.assert_naming_convention(naming_convention);
        return naming_convention;
    }
    return null;
}
//# sourceMappingURL=index.js.map