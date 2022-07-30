## Uranio monorepo

This repo contains as submodules all the Uranio repos.

## How Uranio and Uranio CLI work under the hood.

### Basic concepts

In order to create a new Atom - a relation in a table and an API to query it -
only one file is needed: `./src/atoms/[atom_name]/index.ts`.

Uranio take care of compiling and importing this file.
In order to do that, it first copy the file in
`./node_modules/uranio/src/atoms/server|client/[atom_name]/index.ts` then
comiling it to
`./node_modules/uranio/dist/atoms/server|client/[atom_name]/index.js`.

Then it edits the file: `./node_modules/uranio/src/server|client/register.ts`
exporting the new file with the following line:
`export * from ../atoms/server|client/[atom_name]/index.ts`.
It compile the `register.ts` file to
`./node_modules/uranio/dist/server|client/register.js`

The `register.ts` file is already imported in
`./node_modules/uranio/src/service/ws.ts` so the new Atom will be imported when
starting the service.
It is also imported in `./node_modules/uranio/src/server/generate.ts` since it
is also needed by the `generate.ts` script.
And finally it is imported in the client in the file
`./node_modules/uranio/src/nuxt/plugins/uranio.ts`.

> TODO: User can write its own servie. `register.ts` must be imported also there.


### CLI

`uranio` cli expose the following methods:
- init
- build
- start
- dev
- transpose
- generate

#### Init
```
uranio init
```
This method initialized the repository. It downloads all the dependecies and
create the files and directories needed to work.

#### Build
```
uranio build
```
This method call `uranio transpose` and `uranio generate`.

#### Start
```
uranio start
```
This method will start the service built by `uranio build`. This is the command
used in production.

#### Dev
```
uranio dev
```
This will create a development environment. Every time a file change, it runs
`uranio transpose`, `uranio generate` and then start the service again.

#### Transpose
```
uranio transpose
```
This method copy and compile the user created files inside `./src` directory
into `./node_modules/uranio/`.

Depending from which folder is copying it will do different things.

1) SRC Atom Folder
It copies and process all file from `src/atoms` to:
-- `node_modules/uranio/src/atoms/server`
-- `node_modules/uranio/src/atoms/client`

2) SRC Server Folder
It copies and process all file from `src/server` to:
// TODO

2) SRC Admin Folder
It copies and process all file from `src/admin` to:
// TODO


#### Generate

Each Uranio repo export a binary script that points to `./dist/server/generate.js`.

The scripts are used internally by `uranio-cli` and they are:
```
uranio-generate-core
uranio-generate-api
uranio-generate-trx
uranio-generate-adm
```
respectively for the repos: `core`, `api`, `trx`, `adm`.

Each of these scripts extends the previous one.


#### What `uranio-generate-${repo}` does


##### Update the schema

All scripts generate the Uranio schema, meaning they update the `uranio-schema`
dependency with **new types**.

`uranio-schema` is the repository that stores all the types: `Atom`, `AtomShape`,
`AtomName`, `Molecule`, `RouteName`, etc.

Since the user is defining new `Atom`s, these types must be updated.

Running the scripts `uranio-generate-${repo}` will read the new atoms from the
user defined files and edit the file inside
`node_modules/uranio-schema/dist/typ/atom.d.ts`.


##### Update the client config toml

All scripts also update the toml module for the client.
They read the `uranio.toml` file and generate a module in `src/client/toml.ts`.

So they update:
- `node_modules/uranio/src/client/toml.ts`

And then compile it into:
- `node_modules/uranio/dist/client/toml.js`


##### Update the hooks

If the repo is `trx` or above the script `uranio-generate-${repo}` will also
generate the hooks inside the `uranio-trx` dependency.

It updates the following files, one for the server and one for the client:
- `node_modules/uranio-trx/src/hooks/hooks.ts`
- `node_modules/uranio-trx/src/hooks/hooks_cln.ts`

It then compiles with `esbuild` the two files into:
- `node_modules/uranio-trx/dist/hooks/hooks.js`
- `node_modules/uranio-trx/dist/hooks/hooks_cln.ts`

It also updates the type file:
- `node_modules/uranio-trx/dist/hooks/types.d.ts`




