import test from 'ava'
import td from '../../helpers/testdouble'

td.replace('../../../src/index', { version: '1.0.0' })
const load = td.replace('../../../src/util/load')
td.when(load.pkg()).thenReturn({ devDependencies: { shep: '1.0.1' } })

test('Warns on mismatch', (t) => {
  const warnings = require('../../../src/doctor/rules/shep-version-mismatch')()
  t.is(warnings.length, 1)
})
