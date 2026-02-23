/**
 *
 * CLI types module
 *
 * @packageDocumentation
 */

type ObjectValue<T> = T[keyof T];

export const FLAG = {
  DATABASE: 'database',
  NAMING_CONVETION: 'naming-convention',
  ROOT: 'root',
  TSCONFIG_PATH: 'tsconfig-path',
  VERBOSE: 'verbose',
  VERSION: 'version',
} as const;

export type Flag = ObjectValue<typeof FLAG>;

export type Flags = {
  [k in Flag]: string | number | boolean
}

export const DATABASE = {
  MONGODB: 'mongodb',
  MYSQL: 'mysql',
  POSTGRESQL: 'postgresql',
} as const;

export type Database = ObjectValue<typeof DATABASE>;

export const COMMAND = {
  INIT: 'init',
  GENERATE: 'generate',
  VERSION: 'version',
} as const;

export type Command = ObjectValue<typeof COMMAND>;

export type Arguments = {
  command?: Command;
  flags?: Flags
};

export const NAMING_CONVENTION = {
  CAMEL_CASE: 'camelCase',
  SNAKE_CASE: 'snake_case',
  PASCAL: 'PascalCase',
} as const;

export type NamingConvention = ObjectValue<typeof NAMING_CONVENTION>;

export type InitParams = {
  database: Database;
  naming_convention: NamingConvention;
  root: string
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
}
