import test from 'ava'
import td from '../helpers/testdouble'
import { isArray } from 'util'

test.afterEach(() => {
  td.reset()
})

test('Returns flat array of warnings', (t) => {
  const fooWarn = 'bad foo'
  const barWarn = 'bad bar'
  const rules = td.replace('../../src/lint/rules', td.object(['foo', 'bar']))
  td.when(rules.foo(), { ignoreExtraArgs: true }).thenReturn([fooWarn])
  td.when(rules.bar(), { ignoreExtraArgs: true }).thenReturn([barWarn])

  const warnings = require('../../src/lint')({ quiet: true })
  t.truthy(isArray(warnings))
  t.not(warnings.indexOf(fooWarn), -1)
  t.not(warnings.indexOf(barWarn), -1)
})

test('Passes Options', (t) => {
  const rules = td.replace('../../src/lint/rules', td.object(['foo', 'bar']))

  require('../../src/lint')({ quiet: true, flag: 'set' })
  td.verify(rules.foo(td.matchers.contains({ flag: 'set' })))
  td.verify(rules.bar(td.matchers.contains({ flag: 'set' })))
})
