# Uranio monorepo

This repo contains as submodules all the Uranio repos.

## How Uranio and Uranio CLI work under the hood.

### Core concepts

Uranio is a framework for developing CRUD API. It generates the CRUD
[Create, Read, Update, Delete] methods for querying a database.
A database relation in Uranio is called **Atom**.

Uranio two main features are:

1. Uranio makes possible to define new Atoms and to use them in the current
project, so that each projects have its own Atoms.

2. Uranio makes also possible to have code completition and intelisense with the
new defined Atoms.

In order to make these features work it must extend itself with the new defined
Atoms and their types.

**Therefore Uranio copies the new files inside the `node_modules/uranio` dependency
and re-transpile it.**

---

### The process

A new Atom can be defined with the following file:
```
__root/src/atoms/[atom_name]/index.ts
```
> `__root` is the root of the project.

Before a new Atom can be used, it must be **registred** (more below).

Uranio take care of importing and transpiling the file, by doing the following:

- It first copies the file in
	
	`./node_modules/uranio/src/atoms/server|client/[atom_name]/index.ts`
	
	and it transpiles it to
	
	`./node_modules/uranio/dist/atoms/server|client/[atom_name]/index.js`.
	
	---
	

- It edits the file:
	
	`./node_modules/uranio/src/server|client/register.ts`
	
	adding the following line:
	
	```typescript
	// node_modules/uranio/src/server/register.ts
	// ...
	export * from `../atoms/server/${atom_name}/index.ts`.
	```
	```typescript
	// node_modules/uranio/src/client/register.ts
	// ...
	export * from `../atoms/client/${atom_name}/index.ts`.
	```
	
	and it transpiles the edited `register.ts` file to
	
	`./node_modules/uranio/dist/server|client/register.js`
	
	---
	

The `register.ts` file is imported inside the main executable file (the one
that launch the server):

`./node_modules/uranio/src/service/ws.ts`

---
	

The `register.ts` file is also imported inside the executable file:

`./node_modules/uranio/src/server/generate.ts`

The `generate.ts` executable file is a script that generate the new Atom types
and importing in the library. So it also need to register the new Atoms.
Before the server starts it calls the **generate** script.

---


- The `register.ts` file is then imported in the client inside the file:

`./node_modules/uranio/src/nuxt/plugins/uranio.ts`.

This is done only when using `uranio-adm`.


---

### Uranio CLI

`uranio` cli expose the following methods:
- init
- start
- dev
- info

---

#### Init
```bash
uranio init
```
This method initialized the repository. It downloads all the dependecies and
create the files and directories needed to work.

---


#### Start
```bash
uranio start
```
This method builds and starts the service.

---


#### Dev
```bash
uranio dev
```
This creates a development environment. Every time a file change, it re-builds
re-starts the service.

---

> All the above commands can be run with the flag `--prod` when in production.

---

#### Info
```bash
uranio info
```
It prints the info about the current project.

---

##### The following are used only internally:

#### Transpose

This method copies and transpile the files created inside the `./src` directory
into `./node_modules/uranio/`.

Depending from which folder is copying it will do different things.

1) _SRC Atom Folder_

	It copies and process all file from `src/atoms` to:
	
	-`node_modules/uranio/src/atoms/server|client`

2) _SRC Server Folder_

	It copies and process all file from `src/server` to:
	
	-`node_modules/uranio/src/server/delta/`

3) _SRC Admin Folder_

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

And then transpile it into:
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




