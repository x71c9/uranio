"use strict";
/**
 *
 * Common index module
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
exports.read_yaml_params = read_yaml_params;
exports.set_verbosity = set_verbosity;
exports.resolve_param_root = resolve_param_root;
exports.assert_database = assert_database;
exports.assert_naming_convention = assert_naming_convention;
exports._assert_yaml_params = _assert_yaml_params;
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const pkg_dir_1 = require("pkg-dir");
const r4y_1 = __importDefault(require("r4y"));
const index_1 = require("../log/index");
const utils = __importStar(require("../utils/index"));
const exception = __importStar(require("../exception/index"));
const t = __importStar(require("../types"));
function read_yaml_params(root_path) {
    const yaml_path = `${root_path}/uranio.yml`;
    if (!fs_1.default.existsSync(yaml_path)) {
        throw new exception.UranioCLIException(`Missing uranio.yml file. Run 'uranio init' in order to create one`);
    }
    const data = fs_1.default.readFileSync(yaml_path, 'utf-8');
    const yaml_params = yaml_1.default.parse(data);
    _assert_yaml_params(yaml_params);
    return yaml_params;
}
function set_verbosity(args) {
    var _a;
    const debug = ((_a = args.flags) === null || _a === void 0 ? void 0 : _a.verbose) === true;
    r4y_1.default.config.set({ debug, spinner: index_1.log.spinner });
}
async function resolve_param_root(args) {
    var _a;
    if (args.flags && utils.valid.string((_a = args.flags) === null || _a === void 0 ? void 0 : _a['root'])) {
        return args.flags['root'];
    }
    // Use pkg-dir to find project root by searching for package.json
    // This works correctly with symlinked installations (file:../.. or npm link)
    const root_path = await (0, pkg_dir_1.packageDirectory)();
    if (!root_path) {
        throw new exception.UranioCLIException('Could not find project root (package.json). ' +
            'Make sure you are running this command from within a Node.js project.');
    }
    return root_path;
}
function assert_database(db) {
    if (!Object.values(t.DATABASE).includes(db)) {
        throw new exception.UranioCLIException(`Invalid database flag value. Possible value are` +
            ` [${Object.values(t.DATABASE)}]. Evaluating '${db}'`);
    }
}
function assert_naming_convention(naming_convention) {
    if (!Object.values(t.NAMING_CONVENTION).includes(naming_convention)) {
        throw new exception.UranioCLIException(`Invalid database flag value. Possible value are` +
            ` [${Object.values(t.NAMING_CONVENTION)}]. Evaluating '${naming_convention}'`);
    }
}
const yaml_params_keys = [
    'database',
    'naming_convention',
];
const yaml_params_values = {
    database: Object.values(t.DATABASE),
    naming_convention: Object.values(t.NAMING_CONVENTION),
};
function _assert_yaml_params(params) {
    if (!params || typeof params !== 'object') {
        throw new exception.UranioCLIException(`Invalid Yaml Params. Cannot read uranio.yml`);
    }
    for (let [key, value] of Object.entries(params)) {
        if (!yaml_params_keys.includes(key)) {
            throw new exception.UranioCLIException(`Invalid Yaml Params key. Only the following are allowed:` +
                ` [${yaml_params_keys}]. Evaluating '${key}'`);
        }
        if (!yaml_params_values[key].includes(value)) {
            throw new exception.UranioCLIException(`Invalid Yaml Param value for key '${key}'. Only the following are` +
                ` allowed: [${yaml_params_values[key]}]. Evaluating '${value}'`);
        }
    }
}
//# sourceMappingURL=index.js.map