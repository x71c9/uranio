#!/bin/sh

rm -rf ./node_modules/.uranio
cp -rf ./.uranio node_modules/.uranio
rm -rf ./node_modules/.uranio/node_modules
# rm -rf ./node_modules/.uranio/dist
