#!/usr/bin/env node

import ion from 'i0n';
const log = ion.create();
import {generate} from './generate/index';
const tsconfig_path = `/Users/x71c9/repos/uranio/builder/tsconfig.json`;
const response = generate(tsconfig_path);
log.debug(response);
