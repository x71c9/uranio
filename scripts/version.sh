#!/bin/bash

SEMANTIC_NAME=$1

if [ "$SEMANTIC_NAME" == "" ]; then
  echo
  echo "Missing semantic name parameter. Valid values are [patch, minor, major]"
  echo
  echo "Example: sh $0 patch"
  exit 1
fi

case "$SEMANTIC_NAME" in
  patch)
    yarn version --patch --no-git-tag-version
    break;
    ;;
  minor)
    while true; do
      read -p "Are you sure you want to increase the minor version? [y/n] " yn
      case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer [y]es or [n]o.";;
      esac
    done
    yarn version --minor --no-git-tag-version
    break;
    ;;
  major)
    while true; do
      read -p "Are you sure you want to increase the major version? [y/n] " yn
      case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer [y]es or [n]o.";;
      esac
    done
    yarn version --major --no-git-tag-version
    break;
    ;;
  *)
    echo
    echo "Invalid semantic name parameter. Valid values are [patch, minor, major]"
    echo
    echo "Example: sh $0 patch"
    exit 1
    ;;
esac

VERSION=$(node -p "require('./package.json').version")
yarn publish --new-version $VERSION --no-git-tag-version
