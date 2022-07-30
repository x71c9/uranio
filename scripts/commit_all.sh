#!/usr/bin/env bash

MSG=$1

commit_and_push (){
	git add .
	git commit -m "$MSG"
	git push origin
}

cd urn-cli
commit_and_push

cd ../urn-adm
commit_and_push

cd ../urn-trx
commit_and_push

cd ../urn-api
commit_and_push

cd ../urn-core
commit_and_push

cd ../urn-schema
commit_and_push

cd ../urn-lib
commit_and_push

cd ../urn-dev
commit_and_push

cd ../urn-sync
commit_and_push

