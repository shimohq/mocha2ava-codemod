
const mocha = ['it', 'before', 'after', 'beforeEach', 'afterEach']
const describe = ['describe', 'context']

function it2test (root, j) {
  root.find(j.CallExpression)
    .filter(p => p.value.callee.type === 'Identifier' && mocha.indexOf(p.value.callee.name) > -1)
    .replaceWith(p => {
      let [title, impl] = p.value.arguments
      if (impl == null) {
        impl = title
        title = null
      }
      if (impl.type === 'FunctionExpression' || impl.type === 'ArrowFunctionExpression') {
        impl.params = [j.identifier('t')]
      }
      if (impl.type === 'FunctionExpression' && impl.generator) {
        j.shouldImportCo = true
        impl = j.callExpression(j.memberExpression(j.identifier('co'), j.identifier('wrap')), [impl])
      }

      if (p.value.callee.name !== 'it') {
        const params = []
        if (title.value) {
          params.push(title)
        }
        params.push(impl)
        return j.callExpression(j.memberExpression(j.identifier('test'), j.identifier(p.value.callee.name)), params)
      }
      return j.callExpression(j.identifier('test'), [title, impl])
    })
}

function this2context (root, j) {
  root.find(j.ThisExpression)
    .replaceWith(p => {
      return j.memberExpression(j.identifier('t'), j.identifier('context'))
    })
}

function extractDescribes (root, j) {
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
    .filter(p => p.value.expression.type === 'CallExpression' &&
      p.value.expression.callee.type === 'Identifier' &&
      mocha.indexOf(p.value.expression.callee.name) > -1)
    .forEach(p => {
      const expr = p.value.expression
      let [title, body] = expr.arguments
      if (body == null) {
        body = title
        title = { value: '', type: 'StringLiteral' }
      }
      if (title.type === 'StringLiteral') {
        let prepends = (expr.__descriptions || []).join(': ')
        if (prepends && title.value) {
          prepends += ': '
        }
        expr.arguments = [j.literal(prepends + title.value), body]
      }
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

function insertRequires (root, j) {
  root.find(j.Program)
    .forEach(p => {
      let body = p.value.body

      const useStrictIdx = body.findIndex(n => n.type === 'ExpressionStatement' && n.expression.type === 'Literal' && n.expression.value === 'use strict')
      const usedImport = body.findIndex(n => n.type === 'ImportDeclaration') > -1

      if (usedImport) {
        if (j.shouldImportCo) {
          const importCo = j.importDeclaration([j.importDefaultSpecifier(j.identifier('co'))], j.literal('co'))
          body.splice(useStrictIdx + 1, 0, importCo)
        }
        const importAva = j.importDeclaration([j.importDefaultSpecifier(j.identifier('test'))], j.literal('ava'))
        body.splice(useStrictIdx + 1, 0, importAva)
      } else {
        if (j.shouldImportCo) {
          const requireCo = j.variableDeclaration('const', [j.variableDeclarator(j.identifier('co'), j.callExpression(j.identifier('require'), [j.literal('co')]))])
          body.splice(useStrictIdx + 1, 0, requireCo)
        }
        const requireAva = j.variableDeclaration('const', [j.variableDeclarator(j.identifier('test'), j.callExpression(j.identifier('require'), [j.literal('ava')]))])
        body.splice(useStrictIdx + 1, 0, requireAva)
      }
    })
}

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift
  let source = fileInfo.source
  const s = source.split("'use strict';\n", 2)
  const requirements = "const test = require('ava');\nconst co = require('co');\n"
  if (s.length === 2) {
    s[1] = '\n' + requirements + s[1]
    source = s.join("'use strict'\n")
  } else {
    source = requirements + s[0]
  }
  const root = j(fileInfo.source)
  ;[extractDescribes, it2test, this2context, insertRequires].forEach(fn => fn(root, j))
  return root.toSource({ quote: 'single' })
}

module.exports.parser = 'babylon'
