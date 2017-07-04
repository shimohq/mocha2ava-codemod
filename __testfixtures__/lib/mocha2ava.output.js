'use strict';
const test = require('ava');

const foo = require('bar')

test.before(function(t) {
  foo('before each')
  t.context.bar = foo
})

test('bare it', t => {
  foo()
})

test.beforeEach('root', function(t) {
  foo('before each')
  t.context.bar = foo
})

test('root: describe under root: it under an describe', function(t) {
  foo('it under an describe')
})

test('root: it under root', function(t) {
  foo('it under root')
})

test('root: it with context', function(t) {
  t.context.foo = foo
  t.context.foo(t.context.bar)
})

test('root: it with generator', function*(t) {
  yield foo('it with generator')
  yield * foo('yield with delegation')

  const bar = yield foo('yield in assignment')

  return foo()
})

test('root: it with async', async t => {
  await foo('it with await')
  const bar = await foo('await in assignment')
  return foo()
})