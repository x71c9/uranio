#!/usr/bin/env node
"use strict";

const cp = require('child_process');
const fs = require('fs');
const {deinit} = require('./common');

const repo_folder_name = 'uranio';
const submodule_path = `.uranio/server/src/${repo_folder_name}`;
// const submodule_path = `.uranio/client/src/${repo_folder_name}`;

_proceed();

function _proceed(){
	
	const json_filepath = `urnsub.json`;
	
	// const submodule_server_path = `.uranio/server/src/${repo_folder_name}`;
	// const submodule_client_path = `.uranio/client/src/${repo_folder_name}`;
	
	if(fs.existsSync(json_filepath)){
		const content = fs.readFileSync(json_filepath, {encoding: 'utf8'});
		const urnsub = JSON.parse(content);
		const current_submodule = urnsub.submodule;
		if(typeof current_submodule === 'string'){
			// if(fs.existsSync(submodule_server_path)){
			//   deinit(submodule_server_path);
			// }
			if(fs.existsSync(submodule_path)){
				deinit(submodule_path);
			}
		}
	}
	
}

