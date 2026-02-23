/**
 *
 * CLI types module
 *
 * @packageDocumentation
 */
type ObjectValue<T> = T[keyof T];
export declare const FLAG: {
    readonly DATABASE: "database";
    readonly NAMING_CONVETION: "naming-convention";
    readonly ROOT: "root";
    readonly TSCONFIG_PATH: "tsconfig-path";
    readonly VERBOSE: "verbose";
    readonly VERSION: "version";
};
export type Flag = ObjectValue<typeof FLAG>;
export type Flags = {
    [k in Flag]: string | number | boolean;
};
export declare const DATABASE: {
    readonly MONGODB: "mongodb";
    readonly MYSQL: "mysql";
};
export type Database = ObjectValue<typeof DATABASE>;
export declare const COMMAND: {
    readonly INIT: "init";
    readonly GENERATE: "generate";
    readonly VERSION: "version";
};
export type Command = ObjectValue<typeof COMMAND>;
export type Arguments = {
    command?: Command;
    flags?: Flags;
};
export declare const NAMING_CONVENTION: {
    readonly CAMEL_CASE: "camelCase";
    readonly SNAKE_CASE: "snake_case";
    readonly PASCAL: "PascalCase";
};
export type NamingConvention = ObjectValue<typeof NAMING_CONVENTION>;
export type InitParams = {
    database: Database;
    naming_convention: NamingConvention;
    root: string;
};
export type GenerateParams = {
    database: Database;
    naming_convention: NamingConvention;
    root: string;
    tsconfig_path?: string;
};
export type YamlParams = {
    database: Database;
    naming_convention: NamingConvention;
};
export {};
