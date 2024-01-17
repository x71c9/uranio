/**
 *
 * Generate index module
 *
 * `generate` command do the following:
 *
 * - copy the directory `.uranio` from its root directory into the
 *   `node_modules` of the project where the command is run.
 *
 * - After parsing the types with `plutonio` it updates the copied typescript
 *   files.
 *
 * - It then build the updated `.uranio` files as a typescript project.
 *
 * @packageDocumentation
 */
import * as t from '../types';
export declare function generate(args: t.Arguments): Promise<void>;
