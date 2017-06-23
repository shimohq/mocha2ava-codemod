
# Migrating from mocha to ava [![Travis](https://img.shields.io/travis/shimohq/mocha2ava-codemod.svg)](https://travis-ci.org/shimohq/mocha2ava-codemod) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A `jscodeshift` tranformer for migrating tests from mocha to ava

## Usage

```
$ npm install --global mocha2ava-codemod
or
$ yarn global add mocha2ava-codemod

$ mocha2ava <path> [options]
	path	Files or directory to transform. Can be a glob like src/**.test.js
	Options
	  --force, -f    Bypass Git safety checks and forcibly run codemods
	  --dry, -d      Dry run (no changes are made to files)
```
