#!/usr/bin/env bash

REPO=$1

git submodule deinit $REPO && \
	git rm $REPO && \
	rm -rf $REPO && \
	rm -rf .git/modules/$REPO && \
	git add . && \
	git commit -m "Removed submodule $REPO"
