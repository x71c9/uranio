"use strict";
/**
 *
 * Valid module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.alphanumeric = exports.email = exports.boolean = exports.number = exports.object = exports.string = void 0;
/**
 * Check if
 * typeof s === 'string' && s !== ''
 */
function string(s) {
    return typeof s === 'string' && s !== '';
}
exports.string = string;
/**
 * Check if
 * !!o && typeof o === 'object
 */
function object(o) {
    return !!o && typeof o === 'object';
}
exports.object = object;
/**
 * Check if
 * typeof n === 'number' && !isNaN(n);
 */
function number(n) {
    return typeof n === 'number' && !isNaN(n);
}
exports.number = number;
/**
 * Check if
 * typeof n === 'boolean';
 */
function boolean(b) {
    return typeof b === 'boolean';
}
exports.boolean = boolean;
/**
 * Check if string is a valid email
 * /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
 */
function email(e) {
    if (typeof e !== 'string') {
        return false;
    }
    const pattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return pattern.test(e);
}
exports.email = email;
/**
 * Check if string is a alphanumeric only (including space)
 * /^[a-zA-Z0-9\s]+$/
 */
function alphanumeric(s) {
    if (typeof s !== 'string') {
        return false;
    }
    const pattern = /^[a-zA-Z0-9\s]+$/;
    return pattern.test(s);
}
exports.alphanumeric = alphanumeric;
//# sourceMappingURL=valid.js.map