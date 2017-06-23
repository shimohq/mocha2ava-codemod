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

describe('lib/mocha2ava#import with co', () => {
  defineInlineTest(transform, {}, `
import foo from 'foo'
it('nothing', function*() {})
`, `
import test from 'ava';
import co from 'co';
import foo from 'foo'
test('nothing', co.wrap(function*(t) {}))
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
