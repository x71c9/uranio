"use strict";

const cp = require('child_process');

function deinit(submodule_path){
	execute(`git submodule deinit ${submodule_path}`);
	execute(`git rm ${submodule_path}`);
	execute(`rm -rf ${submodule_path}`);
	execute(`rm -rf ../.git/modules/urn-dot/modules/${submodule_path}`);
	execute('git add .');
	execute(`git commit -m "[removed submodule ${submodule_path}]"`);
}

function add_submodule(origin, submodule_path, branch='master'){
	execute(`git submodule add -b ${branch} ${origin} ${submodule_path}`);
	execute(`git config -f .gitmodules submodule.${submodule_path}.update rebase`);
	execute(`git submodule update --remote --init --recursive`);
	execute(`git submodule foreach --recursive 'case $displaypath in ".uranio"*) git checkout ${branch} ;; *) : ;; esac'`);
}

function execute(command){
	console.log(command);
	cp.execSync(command);
}

module.exports = {
	deinit,
	add_submodule,
	execute
};

