#!/usr/bin/env bash

GH_REPO=$1

DEST=$2

git submodule add -b master git+ssh://git@github.com/x71c9/$GH_REPO $DEST && \
	git config -f .gitmodules submodule.$DEST.update rebase && \
	git submodule update --remote --init --recursive && \
	git submodule foreach --recursive git checkout master && \
	git add . && \
	git commit -m "Added submodule $DEST"
