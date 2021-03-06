const assert = require('assert')

const getPassTestStatement = j => j.expressionStatement(j.callExpression(j.memberExpression(j.identifier('t'), j.identifier('pass')), []))

const avaAsserts = ['pass', 'fail', 'truthy', 'falsy', 'true', 'false', 'is', 'not', 'deepEqual', 'notDeepEqual', 'throws', 'notThrows', 'regex', 'notRegex', 'ifError', 'snapshot']

function addPassTest (root, j) {
  root.find(j.CallExpression, { callee: { type: 'Identifier', name: 'test' } })
    .forEach(p => {
      let [title, impl] = p.value.arguments
      if (impl == null) {
        impl = title
        title = null
      }
      if (impl.type !== 'ArrowFunctionExpression' && impl.type !== 'FunctionExpression') {
        if (impl.type === 'CallExpression' && impl.callee.type === 'MemberExpression' &&
          impl.callee.object.type === 'Identifier' && impl.callee.object.name === 'co' &&
          impl.callee.property.type === 'Identifier' && impl.callee.property.name === 'wrap' &&
          impl.arguments.length === 1) {
          impl = impl.arguments[0]
        } else {
          return
        }
      }

      const block = impl.body
      assert(block.type === 'BlockStatement')

      let tUsed = false
      j(block).find(j.CallExpression, { callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 't' } } })
        .filter(p => p.value.callee.property.type === 'Identifier' && avaAsserts.indexOf(p.value.callee.property.name) > -1)
        .forEach(() => { tUsed = true })

      if (!tUsed) {
        block.body.push(getPassTestStatement(j))
      }
    })
}

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift
  const source = fileInfo.source
  const root = j(source)
  ;[addPassTest].forEach(fn => fn(root, j))
  return root.toSource({ quote: 'single' })
}

module.exports.parser = 'babylon'
