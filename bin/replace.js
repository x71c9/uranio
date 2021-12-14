#!/usr/bin/env node
"use strict";

const minimist = require('minimist');
const cp = require('child_process');
const fs = require('fs');

const prettier = require('prettier');

const {execute, add_submodule, deinit} = require('./common');

const output = cp.execSync(`git status --porcelain`).toString();

const repo_folder_name = 'uranio';
const submodule_path = `src/${repo_folder_name}`;

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
	const valid_repos = ['core', 'api', 'trx', 'adm'];
	
	const selected_branch = args._[1] || 'master';
	
	if(!valid_repos.includes(selected_repo)){
		console.log('Invalid repo argument.');
		process.exit(1);
	}
	
	const urn_rc_filepath = `urnsub.json`;
	if(fs.existsSync(urn_rc_filepath)){
		const content = fs.readFileSync(urn_rc_filepath, {encoding: 'utf8'});
		const urnsub = JSON.parse(content);
		const current_submodule = urnsub.submodule;
		if(typeof current_submodule === 'string'){
			if(fs.existsSync(submodule_path)){
				deinit(submodule_path);
			}
		}
	}else{
		execute(`touch ${urn_rc_filepath}`);
	}
	
	// const paths = _generate_paths(selected_repo, `.uranio/server`);
	const real_paths = _generate_paths(selected_repo, `.`);
	
	// const main_tsconfig = `tsconfig.json`;
	// _update_paths(main_tsconfig, paths);
	
	const real_tsconfig_server = `.uranio/server/tsconfig.json`;
	_update_paths(real_tsconfig_server, real_paths);
	
	const real_tsconfig_client = `.uranio/client/tsconfig.json`;
	_update_paths(real_tsconfig_client, real_paths);
	
	const aliases = _generate_package_aliases(selected_repo);
	_update_package_aliases(`package.json`, aliases);
	
	const origin = `git+ssh://git@bitbucket.org/nbl7/urn-${selected_repo}`;
	
	add_submodule(origin, submodule_path, selected_branch);
	
	const urnsub = {submodule: `${selected_repo}`};
	fs.writeFileSync(urn_rc_filepath, JSON.stringify(urnsub) + '\n');
	
	_update_uranio_json(selected_repo);
	
	execute('git add .');
	execute(`git commit -m "[added submodules ${selected_repo}]"`);
	
}

function _update_uranio_json(selected_repo){
	const uranio_json = `.uranio/uranio.json`;
	if(!fs.existsSync(uranio_json)){
		fs.writeFileSync(uranio_json, '');
	}
	const content = fs.readFileSync(uranio_json, {encoding: 'utf8'});
	let urndata = {};
	try{
		urndata = JSON.parse(content);
		urndata.repo = selected_repo;
	}catch(err){
		urndata.repo = selected_repo;
		urndata.pacman = 'yarn';
		urndata.deploy = 'netlify';
	}
	const str_data = JSON.stringify(urndata);
	const pretty = _pretty(str_data);
	fs.writeFileSync(uranio_json, pretty);
}

function _pretty(content){
	return prettier.format(content, {useTabs: true, tabWidth: 2, parser: 'json'});
}

function _update_package_aliases(package_filepath, aliases){
	if(!fs.existsSync(package_filepath)){
		fs.writeFileSync(package_filepath, '');
	}
	const content = fs.readFileSync(package_filepath, {encoding: 'utf8'});
	const pack_data = JSON.parse(content);
	if(!pack_data._moduleAliases){
		pack_data._moduleAliases = {};
	}
	pack_data._moduleAliases = aliases;
	const str_data = JSON.stringify(pack_data);
	const pretty = _pretty(str_data);
	fs.writeFileSync(package_filepath, pretty);
}

function _update_paths(tsconfig_filepath, paths){
	if(!fs.existsSync(tsconfig_filepath)){
		fs.writeFileSync(tsconfig_filepath, '');
	}
	const content = fs.readFileSync(tsconfig_filepath, {encoding: 'utf8'});
	const tsdata = JSON.parse(content);
	if(!tsdata.compilerOptions){
		tsdata.compilerOptions = {};
	}
	if(!tsdata.compilerOptions.paths){
		tsdata.compilerOptions.paths = [];
	}
	tsdata.compilerOptions.paths = paths;
	const str_data = JSON.stringify(tsdata);
	const pretty = _pretty(str_data);
	fs.writeFileSync(tsconfig_filepath, pretty);
}

function _generate_package_aliases(repo){
	let paths = {};
	paths['uranio'] = `./dist/server/uranio/`;
	paths['uranio-books'] = `./dist/server/books/`;
	switch(repo){
		case 'core':{
			break;
		}
		case 'api':{
			paths['uranio-core'] = `./dist/server/uranio/core/`;
			break;
		}
		case 'trx':{
			paths['uranio-core'] = `./dist/server/uranio/api/core/`;
			paths['uranio-api'] = `./dist/server/uranio/api/`;
			break;
		}
		case 'adm':{
			paths['uranio-core'] = `./dist/server/uranio/trx/api/core/`;
			paths['uranio-api'] = `./dist/server/uranio/trx/api/`;
			paths['uranio-trx'] = `./dist/server/uranio/trx/`;
			break;
		}
	}
	return paths;
}

function _generate_paths(repo, prefix){
	let paths = {};
	paths['uranio'] = [`${prefix}/src/uranio`];
	paths['uranio-books'] = [`${prefix}/src/books`];
	paths['uranio-books/*'] = [`${prefix}/src/books/*`];
	switch(repo){
		case 'core':{
			break;
		}
		case 'api':{
			paths['uranio-core'] = [`${prefix}/src/uranio/core`];
			paths['uranio-core/*'] = [`${prefix}/src/uranio/core/*`];
			break;
		}
		case 'trx':{
			paths['uranio-core'] = [`${prefix}/src/uranio/api/core`];
			paths['uranio-core/*'] = [`${prefix}/src/uranio/api/core/*`];
			paths['uranio-api'] = [`${prefix}/src/uranio/api`];
			paths['uranio-api/*'] = [`${prefix}/src/uranio/api/*`];
			break;
		}
		case 'adm':{
			paths['uranio-core'] = [`${prefix}/src/uranio/trx/api/core`];
			paths['uranio-core/*'] = [`${prefix}/src/uranio/trx/api/core/*`];
			paths['uranio-api'] = [`${prefix}/src/uranio/trx/api`];
			paths['uranio-api/*'] = [`${prefix}/src/uranio/trx/api/*`];
			paths['uranio-trx'] = [`${prefix}/src/uranio/trx`];
			paths['uranio-trx/*'] = [`${prefix}/src/uranio/trx/*`];
			break;
		}
	}
	return paths;
}
