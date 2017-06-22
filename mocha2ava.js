
let requireCo = false

function generatorWrapper(root, j) {
  root.find(j.Function)
    .filter(p => p.value.generator)
    .replaceWith(p => {
      return j.callExpression(j.memberExpression(j.identifier('co'), j.identifier('wrap')), [p.value])
    })
}

const mocha = ['it', 'before', 'after', 'beforeEach', 'afterEach']
const describe = ['describe', 'context'];

function it2test(root, j) {
  root.find(j.CallExpression)
    .filter(p => p.value.callee.type === 'Identifier' && mocha.indexOf(p.value.callee.name) > -1)
    .replaceWith(p => {
      let [title, testBody] = p.value.arguments
      if (testBody == null) {
        testBody = title
        title = null
      }
      testBody.params = [j.identifier('t')]
      if (p.value.callee.name !== 'it') {
        const params = []
        if (title.value) {
          params.push(title)
        }
        params.push(testBody)
        return j.callExpression(j.memberExpression(j.identifier('test'), j.identifier(p.value.callee.name)), params)
      }
      return j.callExpression(j.identifier('test'), [title, testBody])
    })
}

function this2context(root, j) {
  root.find(j.ThisExpression)
    .replaceWith(p => {
      return j.memberExpression(j.identifier('t'), j.identifier('context'))
    })
}

function extractDescribes(root, j) {
  root.find(j.CallExpression)
    .filter(p => describe.indexOf(p.value.callee.name) > -1)
    .forEach(p => {
      const [description, body] = p.value.arguments
      j(body).find(j.CallExpression)
        .filter(p => p.value.callee.type === 'Identifier' && mocha.indexOf(p.value.callee.name) > -1)
        .forEach(pit => {
          pit.value.__descriptions = (pit.value.__descriptions || []).concat([description.value])
        })
    })
  const nodes = []
  root.find(j.ExpressionStatement)
    .filter(p => p.value.expression.type === 'CallExpression'
      && p.value.expression.callee.type === 'Identifier'
      && mocha.indexOf(p.value.expression.callee.name) > -1)
    .forEach(p => {
      const expr = p.value.expression
      let [title, body] = expr.arguments
      if (body == null) {
        body = title
        title = { value: ''}
      }
      let prepends = (expr.__descriptions || []).join(': ')
      if (prepends && title.value) {
        prepends += ': '
      }
      expr.arguments = [j.literal(prepends + title.value), body]
      nodes.push(p.value)
    })
  root.find(j.CallExpression)
    .filter(p => describe.indexOf(p.value.callee.name) > -1)
    .remove()
  root.find(j.Program)
    .forEach(p => {
      let body = p.value.body
      body = body.filter(n => {
        if (n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression' && n.expression.callee.type === 'Identifier' && mocha.indexOf(n.expression.callee.name) > -1) {
          return false
        }
        return true
      })
      p.value.body = body.concat(nodes)
    })
}

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift
  let source = fileInfo.source
  const s = source.split("'use strict';\n", 2)
  const requirements = "const test = require('ava');\nconst co = require('co');\n"
  if (s.length === 2) {
    s[1] = "\n" + requirements + s[1]
    source = s.join("'use strict'\n")
  } else {
    source = requirements + s[0]
  }
  const root = j(source)
  ;[extractDescribes, it2test, generatorWrapper, this2context].forEach(fn => fn(root, j))
  return root.toSource({ quote: 'single' })
}

module.exports.parser = 'babylon'
