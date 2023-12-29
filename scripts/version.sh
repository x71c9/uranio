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
      read -p "Are you sure you want to increase the minor version? [y/n] " response
      ;;
    major)
      read -p "Are you sure you want to increase the major version? [y/n] " response
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

# Get the current version from package.json
current_version=$(jq -r '.version' package.json)

# Extract major, minor, and patch parts of the version
major=$(echo $current_version | cut -d. -f1)
minor=$(echo $current_version | cut -d. -f2)
patch=$(echo $current_version | cut -d. -f3)

increment_version() {
  if [ "$1" == "patch" ]; then
    patch=$((patch + 1))
  elif [ "$1" == "minor" ]; then
    minor=$((minor + 1))
    patch=0
  elif [ "$1" == "major" ]; then
    major=$((major + 1))
    minor=0
    patch=0
  fi
}

case "$response" in
  [Yy]* )
    case "$SEMANTIC_NAME" in
      patch)
        # npm version patch
        increment_version patch
        ;;
      minor)
        # npm version minor
        increment_version minor
        ;;
      major)
        # npm version major
        increment_version major
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

new_version="$major.$minor.$patch"

DOT_URANIO_PACKAGE_JSON_PATH=.uranio/package.json
VERSION=$(node -p "require('./package.json').version")

jq --arg uranio_version "$new_version" \
   '.dependencies |= . + { "uranio": $uranio_version }' \
   "$DOT_URANIO_PACKAGE_JSON_PATH" > tmpfile && mv tmpfile "$DOT_URANIO_PACKAGE_JSON_PATH"

jq --arg uranio_version "$new_version" '.version = $uranio_version' \
  package.json > tmp_package.json && mv tmp_package.json package.json

git add .
git commit -m "auto-updated .uranio dependency uranio"
git tag -a v$new_version -m "v$new_version"

git push origin
git push origin v$new_version
yarn publish --new-version $new_version

