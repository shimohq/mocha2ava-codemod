test('should add a pass test statement', t => {
  foo()
  t.pass();
})

test('should also work on co wrapped impl', co.wrap(function* (t) {
  foo()
  t.pass();
}))

test('should not add a pass test statement if t is used', t => {
  foo()
  t.fail()
})
