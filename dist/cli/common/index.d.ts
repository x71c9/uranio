/**
 *
 * Common index module
 *
 * @packageDocumentation
 */
import * as t from '../types';
export declare function read_yaml_params(root_path: string): t.YamlParams;
export declare function set_verbosity(args: t.Arguments): void;
export declare function resolve_param_root(args: t.Arguments): Promise<string>;
export declare function assert_database(db: unknown): asserts db is t.Database;
export declare function assert_naming_convention(naming_convention: unknown): asserts naming_convention is t.NamingConvention;
export declare function _assert_yaml_params(params: unknown): asserts params is t.YamlParams;
