/**
 *
 * Init index module
 *
 * `init` command do the following:
 *
 * - ask for the following data:
 *   - type of database: 'mongodb' | 'mysql'
 *   - type of naming convention: 'snake_case' | 'camelCase' | 'same'
 *
 * - create a yaml file in the root directory of the project with the selected
 *   data.
 *
 * @packageDocumentation
 */
import * as t from '../types';
export declare function init(args: t.Arguments): Promise<void>;
