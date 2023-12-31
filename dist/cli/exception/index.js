"use strict";
/**
 *
 * Exception index module
 *
 * @packageDocumentation
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UranioCLIException = void 0;
class UranioCLIException extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.family = 'UranioCLIException';
    }
}
exports.UranioCLIException = UranioCLIException;
//# sourceMappingURL=index.js.map