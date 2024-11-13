"use strict";
/**
 *
 * Utils object module
 *
 * @packageDocumentation
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.no_undefined = no_undefined;
exports.deep_clone = deep_clone;
function no_undefined(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function deep_clone(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
}
//# sourceMappingURL=object.js.map