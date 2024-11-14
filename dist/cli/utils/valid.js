"use strict";
/**
 *
 * Valid module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.string = string;
exports.object = object;
exports.number = number;
exports.boolean = boolean;
exports.email = email;
exports.alphanumeric = alphanumeric;
/**
 * Check if
 * typeof s === 'string' && s !== ''
 */
function string(s) {
    return typeof s === 'string' && s !== '';
}
/**
 * Check if
 * !!o && typeof o === 'object
 */
function object(o) {
    return !!o && typeof o === 'object';
}
/**
 * Check if
 * typeof n === 'number' && !isNaN(n);
 */
function number(n) {
    return typeof n === 'number' && !isNaN(n);
}
/**
 * Check if
 * typeof n === 'boolean';
 */
function boolean(b) {
    return typeof b === 'boolean';
}
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
//# sourceMappingURL=valid.js.map