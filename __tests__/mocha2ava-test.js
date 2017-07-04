/* global jest, describe */
jest.autoMockOff()
const defineTest = require('jscodeshift/src/testUtils').defineTest
const defineInlineTest = require('jscodeshift/src/testUtils').defineInlineTest
const transform = require('../lib/mocha2ava')

defineTest(__dirname, 'lib/mocha2ava')

describe('lib/mocha2ava#import', () => {
  defineInlineTest(transform, {}, `
import foo from 'foo'
it('nothing', () => {})
`, `
import test from 'ava';
import foo from 'foo'
test('nothing', t => {})
`)
})

describe('lib/mocha2ava#require', () => {
  defineInlineTest(transform, {}, `
const foo = require('foo')
it('nothing', () => {})
`, `
const test = require('ava');
const foo = require('foo')
test('nothing', t => {})
`)
})

describe('lib/mocha2ava#imported', () => {
  defineInlineTest(transform, {}, `
import foo from 'foo'
import test from 'ava'
it('nothing', () => {})
`, `
import foo from 'foo'
import test from 'ava'
test('nothing', t => {})
`)
})

describe('lib/mocha2ava#required', () => {
  defineInlineTest(transform, {}, `
const foo = require('foo')
const test = require('ava')
it('nothing', () => {})
`, `
const foo = require('foo')
const test = require('ava')
test('nothing', t => {})
`)
})
