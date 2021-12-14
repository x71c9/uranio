#!/usr/bin/env node
"use strict";

const minimist = require('minimist');
const cp = require('child_process');
const fs = require('fs');
const {execute, add_submodule, deinit} = require('./common');

const output = cp.execSync(`git status --porcelain`).toString();
const repo_folder_name = 'uranio';

if(output === ''){
	console.log('Working directory clean.');
	_proceed();
}else{
	console.log('-------------------------------------------------------------');
	console.log('Working directory not clean. Please commit before proceeding.');
	console.log('-------------------------------------------------------------');
}

function _proceed(){
	
	const args = minimist(process.argv.slice(2));
	const selected_repo = args._[0];
	const valid_repos = ['core', 'api', 'trx'];
	
	const selected_branch = args._[1] || 'master';
	
	if(!valid_repos.includes(selected_repo)){
		console.log('Invalid repo argument.');
		process.exit(1);
	}
	
	const json_filepath = `urnsub.json`;
	
	const submodule_server_path = `.uranio/server/src/${repo_folder_name}`;
	const submodule_client_path = `.uranio/client/src/${repo_folder_name}`;
	
	if(fs.existsSync(json_filepath)){
		const content = fs.readFileSync(json_filepath, {encoding: 'utf8'});
		const urnsub = JSON.parse(content);
		const current_submodule = urnsub.submodule;
		if(typeof current_submodule === 'string'){
			if(fs.existsSync(submodule_server_path)){
				deinit(submodule_server_path);
			}
			if(fs.existsSync(submodule_client_path)){
				deinit(submodule_client_path);
			}
		}
	}else{
		execute(`touch ${json_filepath}`);
	}
	
	const origin = `git+ssh://git@bitbucket.org/nbl7/urn-${selected_repo}`;
	
	add_submodule(origin, submodule_server_path, selected_branch);
	add_submodule(origin, submodule_client_path, selected_branch);
	execute(`git submodule update --remote --init --recursive`);
	
	const urnsub = {submodule: `${selected_repo}`};
	fs.writeFileSync(json_filepath, JSON.stringify(urnsub) + '\n');
	
	execute('git add .');
	execute(`git commit -m "[added submodules ${selected_repo}]"`);
	
}

