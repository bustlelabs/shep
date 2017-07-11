import test from 'ava'
import td from '../helpers/testdouble'

test.afterEach(() => {
  td.reset()
})

test('Returns flat array of warnings', async (t) => {
  const fooWarn = 'bad foo'
  const barWarn = 'bad bar'
  const rules = td.replace('../../src/doctor/rules', td.object(['foo', 'bar']))
  td.when(rules.foo(), { ignoreExtraArgs: true }).thenReturn([fooWarn])
  td.when(rules.bar(), { ignoreExtraArgs: true }).thenReturn([barWarn])

  const { warnings } = await require('../../src/doctor')({ quiet: true })
  t.truthy(Array.isArray(warnings))
  t.not(warnings.indexOf(fooWarn), -1)
  t.not(warnings.indexOf(barWarn), -1)
})
