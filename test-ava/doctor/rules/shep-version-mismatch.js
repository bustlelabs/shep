import test from 'ava'
import td from '../../helpers/testdouble'

const load = td.replace('../../../src/util/load')

td.replace('../../../src/index', { version: '1.0.0' })

test.afterEach(() => td.reset())

test('Warns on mismatch', async (t) => {
  td.when(load.pkg()).thenResolve({ devDependencies: { shep: '1.0.1' } })
  const warnings = await require('../../../src/doctor/rules/shep-version-mismatch')()
  t.is(warnings.length, 1)
})

test('No warnings on matching', async (t) => {
  td.when(load.pkg()).thenResolve({ devDependencies: { shep: '1.0.0' } })
  const warnings = await require('../../../src/doctor/rules/shep-version-mismatch')()
  t.is(warnings.length, 0)
})
