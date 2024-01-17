"use strict";
/**
 *
 * Args index module
 *
 * @packageDocumentation
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve_args = void 0;
const exception = __importStar(require("../exception/index"));
const utils = __importStar(require("../utils/index"));
const t = __importStar(require("../types"));
const flag_shorts = {
    r: 'root',
    p: 'tsconfig-path',
    v: 'verbose',
};
const flag_types = {
    'database': 'string',
    'root': 'string',
    'tsconfig-path': 'string',
    'verbose': 'boolean',
    'version': 'boolean',
};
function resolve_args(args) {
    const command = args[0] && args[0][0] !== '-' ? args[0] : undefined;
    _assert_command(command);
    const flags = _resolve_flags(args);
    return {
        command,
        flags,
    };
}
exports.resolve_args = resolve_args;
function _assert_command(command) {
    if (!command) {
        return;
    }
    if (!Object.values(t.COMMAND).includes(command)) {
        throw new exception.UranioCLIException(`Invalid command. Possibile commands are [${Object.values(t.COMMAND).join(', ')}]`);
    }
}
function _resolve_flags(args) {
    var _a;
    if (args.length < 1) {
        return undefined;
    }
    // const first_flag = args[0];
    // if (!first_flag || first_flag[0] !== '-') {
    //   throw new exception.UranioCLIException(`Invalid flag. Flag should start with '-' or '--'`);
    // }
    const flags = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i] && ((_a = args[i]) === null || _a === void 0 ? void 0 : _a[0]) !== '-') {
            continue;
        }
        const extended_flag_name = _resolve_extended_flag_name(args[i]);
        const flag_type = _resolve_flag_type(extended_flag_name);
        let flag_value;
        switch (flag_type) {
            case 'string': {
                const next_index = ++i;
                flag_value = args[next_index];
                if (!utils.valid.string(flag_value)) {
                    throw new exception.UranioCLIException(`Invaid flag value. Value of ${args[i]} must be a string`);
                }
                break;
            }
            case 'number': {
                const next_index = ++i;
                flag_value = args[next_index];
                if (!utils.valid.number(flag_value)) {
                    throw new exception.UranioCLIException(`Invaid flag value. Value of ${args[i]} must be a number`);
                }
                break;
            }
            case 'boolean': {
                flag_value = true;
                break;
            }
            default: {
                throw new exception.UranioCLIException(`Invaid flag type`);
            }
        }
        flags[extended_flag_name] = flag_value;
    }
    return flags;
}
function _resolve_extended_flag_name(flag) {
    if (!flag) {
        throw new exception.UranioCLIException(`Invaid flag`);
    }
    const trimmed_flag = flag.replace(/^-{1,2}/, '');
    if (trimmed_flag in flag_shorts) {
        return flag_shorts[trimmed_flag];
    }
    if (Object.values(t.FLAG).includes(trimmed_flag)) {
        return trimmed_flag;
    }
    throw new exception.UranioCLIException(`Invaid flag. Flag must be one of ${Object.values(t.FLAG)}`);
}
function _resolve_flag_type(flag) {
    return flag_types[flag];
}
//# sourceMappingURL=index.js.map