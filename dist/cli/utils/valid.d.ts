/**
 *
 * Valid module
 *
 * @packageDocumentation
 */
/**
 * Check if
 * typeof s === 'string' && s !== ''
 */
export declare function string(s: unknown): s is string;
/**
 * Check if
 * !!o && typeof o === 'object
 */
export declare function object(o: unknown): o is Record<string, any>;
/**
 * Check if
 * typeof n === 'number' && !isNaN(n);
 */
export declare function number(n: unknown): n is number;
/**
 * Check if
 * typeof n === 'boolean';
 */
export declare function boolean(b: unknown): b is boolean;
/**
 * Check if string is a valid email
 * /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
 */
export declare function email(e: unknown): e is string;
/**
 * Check if string is a alphanumeric only (including space)
 * /^[a-zA-Z0-9\s]+$/
 */
export declare function alphanumeric(s: unknown): s is string;
