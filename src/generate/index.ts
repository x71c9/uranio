/**
 *
 * Generate index module
 *
 */

import ray from 'r4y';
import plutonio from 'plutonio';
import {log} from './log/index';
import * as utils from '../utils/index';

ray.config.set({
  debug: true,
});

type GenerateParams = {
  root: string
  tsconfig_path?: string
}

export async function generate(params: GenerateParams){
  await _copy_dot_uranio(params);
  await _update_dot_uranio(params);
  await _build_dot_uranio(params);
}

async function _copy_dot_uranio(params: GenerateParams){
  const dot_path = `${params.root}/node_modules/uranio/.uranio`;
  const destination_path = `${params.root}/node_modules/.uranio`;
  await ray.execute(`rm -rf ${destination_path}`);
  await ray.execute(`cp -rf ${dot_path} ${destination_path}`);
}

async function _update_dot_uranio(params: GenerateParams){
  const tsconfig_path = _resolve_tsconfig_path(params);
  const scanned = plutonio.scanner(tsconfig_path);
  log.info(scanned);
}

async function _build_dot_uranio(params: GenerateParams){
  const copied_dot_uranio_tsconfig_path = `${params.root}/node_modules/.uranio/tsconfig.json`;
  await ray.execute(`yarn tsc --project ${copied_dot_uranio_tsconfig_path}`);
}

function _resolve_tsconfig_path(params: GenerateParams){
  if(utils.valid.string(params.tsconfig_path)){
    return params.tsconfig_path;
  }
  return `${params.root}/tsconfig.json`;
}
