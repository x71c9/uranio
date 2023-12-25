"use strict";
/**
 *
 * Generate index module
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const plutonio_1 = __importDefault(require("plutonio"));
function generate(tsconfig_path) {
    const scanned = plutonio_1.default.scanner(tsconfig_path);
    return scanned;
}
exports.generate = generate;
//# sourceMappingURL=index.js.map