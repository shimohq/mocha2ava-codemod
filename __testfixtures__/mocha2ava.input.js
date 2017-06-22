'use strict';

const foo = require('bar')

before(function () {
  foo('before each')
  this.bar = foo
})

it('bare it', function () {
  foo()
})

describe('root', function () {
  beforeEach(function () {
    foo('before each')
    this.bar = foo
  })

  describe('describe under root', function () {
    it('it under an describe', function () {
      foo('it under an describe')
    })
  })

  it('it under root', function () {
    foo('it under root')
  })

  it('it with context', function () {
    this.foo = foo
    this.foo(this.bar)
  })

  it('it with generator', function* () {
    yield foo('it with generator')
    yield* foo('yield with delegation')

    const bar = yield foo('yield in assignment')

    return foo()
  })
})
