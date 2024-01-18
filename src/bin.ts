#!/usr/bin/env node

import ion from 'i0n';
import {log} from './cli/log/index';
import * as exception from './cli/exception/index';
import cli from './cli/index';

const args = process.argv.slice(2);

_handle_exception_wrapper(cli.resolve_args, args)().then(
  async (resolved_arguments) => {
    async function _set_verbosity(args: cli.Arguments) {
      if (args.flags?.verbose === true) {
        log.params.log_level = ion.LOG_LEVEL.TRACE;
        return;
      }
      log.params.log_level = ion.LOG_LEVEL.INFO;
    }
    async function _run_command(args: cli.Arguments) {
      switch (args.command) {
        case 'generate': {
          await cli.generate(args);
          break;
        }
        default: {
          await cli.version(args);
          break;
        }
      }
    }
    await _handle_exception_wrapper(_set_verbosity, resolved_arguments)();
    await _handle_exception_wrapper(_run_command, resolved_arguments)();
  }
);

function _handle_exception_wrapper(fn: (...args: any) => any, ...args: any) {
  return async () => {
    try {
      return await fn(...args);
    } catch (err) {
      if (
        err instanceof exception.UranioCLIException &&
        err.family === 'UranioCLIException'
      ) {
        log.error(err.message);
        process.exit(1);
      }
      throw err
    }
  };
}
