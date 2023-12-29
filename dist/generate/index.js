"use strict";
/**
 *
 * Generate index module
 *
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
const r4y_1 = __importDefault(require("r4y"));
const plutonio_1 = __importDefault(require("plutonio"));
const index_1 = require("./log/index");
const utils = __importStar(require("../utils/index"));
r4y_1.default.config.set({
    debug: true,
});
async function generate(params) {
    await _copy_dot_uranio(params);
    await _update_dot_uranio(params);
    await _build_dot_uranio(params);
}
exports.generate = generate;
async function _copy_dot_uranio(params) {
    const dot_path = `${params.root}/node_modules/uranio/.uranio`;
    const destination_path = `${params.root}/node_modules/.uranio`;
    await r4y_1.default.execute(`rm -rf ${destination_path}`);
    await r4y_1.default.execute(`cp -rf ${dot_path} ${destination_path}`);
}
async function _update_dot_uranio(params) {
    const tsconfig_path = _resolve_tsconfig_path(params);
    const scanned = plutonio_1.default.scanner(tsconfig_path);
    index_1.log.info(scanned);
}
async function _build_dot_uranio(params) {
    const copied_dot_uranio_tsconfig_path = `${params.root}/node_modules/.uranio/tsconfig.json`;
    await r4y_1.default.execute(`yarn tsc --project ${copied_dot_uranio_tsconfig_path}`);
}
function _resolve_tsconfig_path(params) {
    if (utils.valid.string(params.tsconfig_path)) {
        return params.tsconfig_path;
    }
    return `${params.root}/tsconfig.json`;
}
//# sourceMappingURL=index.js.map