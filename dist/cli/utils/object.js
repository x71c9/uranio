"use strict";
/**
 *
 * Utils object module
 *
 * @packageDocumentation
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deep_clone = exports.no_undefined = void 0;
function no_undefined(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.no_undefined = no_undefined;
function deep_clone(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    // return JSON.parse(JSON.stringify(obj));
    return structuredClone(obj);
}
exports.deep_clone = deep_clone;
//# sourceMappingURL=object.js.map