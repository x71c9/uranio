#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i0n_1 = __importDefault(require("i0n"));
const log = i0n_1.default.create();
const index_1 = require("./generate/index");
const tsconfig_path = `/Users/x71c9/repos/uranio/builder/tsconfig.json`;
const response = (0, index_1.generate)(tsconfig_path);
log.debug(response);
//# sourceMappingURL=bin.js.map