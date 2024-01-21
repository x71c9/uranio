/**
 *
 * Args index module
 *
 * @packageDocumentation
 */

import * as exception from '../exception/index';
import * as utils from '../utils/index';
import * as t from '../types';

type FlagShorts = {
  [k: string]: t.Flag;
};

const flag_shorts: FlagShorts = {
  d: 'database',
  r: 'root',
  p: 'tsconfig-path',
  v: 'verbose',
};

type FlagType = 'string' | 'number' | 'boolean';

type FlagTypes = {
  [k in t.Flag]: FlagType;
};

const flag_types: FlagTypes = {
  'database': 'string',
  'naming-convention': 'string',
  'root': 'string',
  'tsconfig-path': 'string',
  'verbose': 'boolean',
  'version': 'boolean',
};

export function resolve_args(args: string[]): t.Arguments {
  const command = args[0] && args[0][0] !== '-' ? args[0] : undefined;
  _assert_command(command);
  const flags = _resolve_flags(args);
  return {
    command,
    flags,
  };
}

function _assert_command(command?: unknown): asserts command is t.Command {
  if (!command) {
    return;
  }
  if (!Object.values(t.COMMAND).includes(command as any)) {
    throw new exception.UranioCLIException(
      `Invalid command. Possibile commands are [${Object.values(t.COMMAND).join(
        ', '
      )}]`
    );
  }
}

function _resolve_flags(args: string[]): t.Flags | undefined {
  if (args.length < 1) {
    return undefined;
  }
  // const first_flag = args[0];
  // if (!first_flag || first_flag[0] !== '-') {
  //   throw new exception.UranioCLIException(`Invalid flag. Flag should start with '-' or '--'`);
  // }
  const flags: any = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] && args[i]?.[0] !== '-') {
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
          throw new exception.UranioCLIException(
            `Invaid flag value. Value of ${args[i]} must be a string`
          );
        }
        break;
      }
      case 'number': {
        const next_index = ++i;
        flag_value = args[next_index];
        if (!utils.valid.number(flag_value)) {
          throw new exception.UranioCLIException(
            `Invaid flag value. Value of ${args[i]} must be a number`
          );
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

function _resolve_extended_flag_name(flag?: string): t.Flag {
  if (!flag) {
    throw new exception.UranioCLIException(`Invaid flag`);
  }
  const trimmed_flag = flag.replace(/^-{1,2}/, '');
  if (trimmed_flag in flag_shorts) {
    return flag_shorts[trimmed_flag] as t.Flag;
  }
  if (Object.values(t.FLAG).includes(trimmed_flag as any)) {
    return trimmed_flag as t.Flag;
  }
  throw new exception.UranioCLIException(
    `Invaid flag. Flag must be one of ${Object.values(t.FLAG)}`
    + ` Evaluating '${flag}'`
  );
}

function _resolve_flag_type(flag: t.Flag): FlagType {
  return flag_types[flag];
}
