#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i0n_1 = __importDefault(require("i0n"));
const index_1 = require("./cli/log/index");
const exception = __importStar(require("./cli/exception/index"));
const index_2 = __importDefault(require("./cli/index"));
const args = process.argv.slice(2);
_handle_exception_wrapper(index_2.default.resolve_args, args)().then(async (resolved_arguments) => {
    async function _set_verbosity(args) {
        var _a;
        if (((_a = args.flags) === null || _a === void 0 ? void 0 : _a.verbose) === true) {
            index_1.log.params.log_level = i0n_1.default.LOG_LEVEL.TRACE;
            return;
        }
        index_1.log.params.log_level = i0n_1.default.LOG_LEVEL.INFO;
    }
    async function _run_command(args) {
        switch (args.command) {
            case 'generate': {
                await index_2.default.generate(args);
                break;
            }
            default: {
                await index_2.default.version(args);
                break;
            }
        }
    }
    await _handle_exception_wrapper(_set_verbosity, resolved_arguments)();
    await _handle_exception_wrapper(_run_command, resolved_arguments)();
});
function _handle_exception_wrapper(fn, ...args) {
    return async () => {
        try {
            return await fn(...args);
        }
        catch (err) {
            if (err instanceof exception.UranioCLIException &&
                err.family === 'UranioCLIException') {
                index_1.log.error(err.message);
                process.exit(1);
            }
            throw err;
        }
    };
}
//# sourceMappingURL=bin.js.map