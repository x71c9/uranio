/**
 *
 * CLI types module
 *
 * @packageDocumentation
 */
type ObjectValue<T> = T[keyof T];
export declare const COMMAND: {
    readonly GENERATE: "generate";
    readonly VERSION: "version";
};
export type Command = ObjectValue<typeof COMMAND>;
export declare const FLAG: {
    readonly ROOT: "root";
    readonly TSCONFIG_PATH: "tsconfig-path";
    readonly VERBOSE: "verbose";
    readonly VERSION: "version";
};
export type Flag = ObjectValue<typeof FLAG>;
export type Flags = {
    [k in Flag]: string | number | boolean;
};
export type Arguments = {
    command?: Command;
    flags?: Flags;
};
export {};
