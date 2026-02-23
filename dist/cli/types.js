"use strict";
/**
 *
 * CLI types module
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAMING_CONVENTION = exports.COMMAND = exports.DATABASE = exports.FLAG = void 0;
exports.FLAG = {
    DATABASE: 'database',
    NAMING_CONVETION: 'naming-convention',
    ROOT: 'root',
    TSCONFIG_PATH: 'tsconfig-path',
    VERBOSE: 'verbose',
    VERSION: 'version',
};
exports.DATABASE = {
    MONGODB: 'mongodb',
    MYSQL: 'mysql',
    POSTGRESQL: 'postgresql',
};
exports.COMMAND = {
    INIT: 'init',
    GENERATE: 'generate',
    VERSION: 'version',
};
exports.NAMING_CONVENTION = {
    CAMEL_CASE: 'camelCase',
    SNAKE_CASE: 'snake_case',
    PASCAL: 'PascalCase',
};
//# sourceMappingURL=types.js.map