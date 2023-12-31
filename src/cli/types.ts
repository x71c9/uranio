/**
 *
 * CLI types module
 *
 * @packageDocumentation
 */

type ObjectValue<T> = T[keyof T];

export const COMMAND = {
  GENERATE: 'generate',
  VERSION: 'version',
} as const;

export type Command = ObjectValue<typeof COMMAND>;

export const FLAG = {
  ROOT: 'root',
  TSCONFIG_PATH: 'tsconfig-path',
  VERBOSE: 'verbose',
  VERSION: 'version',
} as const;

export type Flag = ObjectValue<typeof FLAG>;

export type Flags = {
  [k in Flag]: string | number | boolean
}

export type Arguments = {
  command?: Command;
  flags?: Flags
};

