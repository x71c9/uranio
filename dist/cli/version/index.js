"use strict";
/**
 *
 * Version index module
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
exports.version = version;
const fs_1 = __importDefault(require("fs"));
const index_1 = require("../log/index");
const exception = __importStar(require("../exception/index"));
const common = __importStar(require("../common/index"));
async function version(args) {
    const root_path = common.resolve_param_root(args);
    const uranio_package_json_path = `${root_path}/node_modules/uranio/package.json`;
    if (!fs_1.default.existsSync(uranio_package_json_path)) {
        throw new exception.UranioCLIException(`Missing uranio package.json [${uranio_package_json_path}]`);
    }
    const data = fs_1.default.readFileSync(uranio_package_json_path, 'utf-8');
    const parsed_json = JSON.parse(data);
    index_1.log.info(`Uranio version: ${parsed_json.version}`);
}
//# sourceMappingURL=index.js.map