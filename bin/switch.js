#!/usr/bin/env node
"use strict";

const minimist = require('minimist');
const cp = require('child_process');
const {execute} = require('./common');
const output = cp.execSync(`git status --porcelain`).toString();

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
	const selected_pacman = args._[1] || 'npm';
	const selected_branch = args._[2] || 'master';
	const valid_repos = ['core', 'api', 'trx', 'adm'];
	const valid_pacman = ['npm', 'yarn'];
	
	if(!valid_repos.includes(selected_repo)){
		console.log('Invalid repo argument. It should be one of the following: ' + valid_repos);
		process.exit(1);
	}
	if(!valid_pacman.includes(selected_pacman)){
		console.log('Invalid pacman argument. It should be one of the following: ' + valid_pacman);
		process.exit(1);
	}
	
	execute(`git checkout ${selected_repo}`);
	
	execute(`node bin/replace ${selected_repo} ${selected_branch}`);
	
	execute(`rm -rf node_modules/ yarn.pack package-lock.json`);
	
	if(selected_pacman === 'yarn'){
		execute('yarn install');
	}else{
		execute('npm install');
	}
	
	execute('uranio init');
	
}

