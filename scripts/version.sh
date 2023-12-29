#!/bin/bash

if [[ `git status --porcelain` ]]; then
  echo
  echo "Error: Git working directory is not clean. Please commit your changes or stash them."
  echo
  exit 1
fi;

SEMANTIC_NAME=""
FORCE_FLAG=""

# Parse command line arguments
while [ "$#" -gt 0 ]; do
  case "$1" in
    --force)
      FORCE_FLAG="--force"
      shift
      ;;
    *)
      if [ -z "$SEMANTIC_NAME" ]; then
        SEMANTIC_NAME="$1"
      else
        echo "Unknown argument: $1"
        exit 1
      fi
      shift
      ;;
  esac
done

if [ "$SEMANTIC_NAME" == "" ]; then
  echo
  echo "Missing semantic name parameter. Valid values are [patch, minor, major]"
  echo
  echo "Example: sh $0 patch"
  exit 1
fi

if [ "$FORCE_FLAG" == "--force" ]; then
  response="y"
else
  case "$SEMANTIC_NAME" in
    patch)
      read -p "Are you sure you want to increase the patch version? [y/n] " response
      ;;
    minor)
      read -p "Are you sure you want to increase the minor version? [y/n] " respnose
      ;;
    major)
      read -p "Are you sure you want to increase the major version? [y/n] " respnose
      ;;
    *)
      echo
      echo "Invalid semantic name parameter. Valid values are [patch, minor, major]"
      echo
      echo "Example: sh $0 patch"
      exit 1
      ;;
  esac
fi

case "$response" in
  [Yy]* )
    case "$SEMANTIC_NAME" in
      patch)
        npm version patch
        ;;
      minor)
        npm version minor
        ;;
      major)
        npm version major
        ;;
    esac
    ;;
  [Nn]* ) 
    echo "Changing version canceled."
    exit 1
    ;;
  *)
    echo "Please answer [y]es or [n]o."
    exit 1
    ;;
esac

git push origin
git push origin v$(node -p "require('./package.json').version")

