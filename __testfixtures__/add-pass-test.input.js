test('should add a pass test statement', t => {
  foo()
})

test('should not add a pass test statement if t is used', t => {
  foo()
  t.fail()
})
