import test from 'ava'
import td from '../../helpers/testdouble'

const load = td.replace('../../../src/util/load')
td.when(load.api()).thenReturn({ info: { description: '' } })

test('Returns warning when no description set', (t) => {
  const warnings = require('../../../src/doctor/rules/missing-api-description')()
  t.is(warnings.length, 1)
})
