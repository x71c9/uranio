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
export function string(s: unknown): s is string {
  return typeof s === 'string' && s !== '';
}

/**
 * Check if
 * !!o && typeof o === 'object
 */
export function object(o: unknown): o is Record<string, any> {
  return !!o && typeof o === 'object';
}

/**
 * Check if
 * typeof n === 'number' && !isNaN(n);
 */
export function number(n: unknown): n is number {
  return typeof n === 'number' && !isNaN(n);
}

/**
 * Check if
 * typeof n === 'boolean';
 */
export function boolean(b: unknown): b is boolean {
  return typeof b === 'boolean';
}

/**
 * Check if string is a valid email
 * /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
 */
export function email(e: unknown): e is string {
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
export function alphanumeric(s: unknown): s is string {
  if (typeof s !== 'string') {
    return false;
  }
  const pattern = /^[a-zA-Z0-9\s]+$/;
  return pattern.test(s);
}
