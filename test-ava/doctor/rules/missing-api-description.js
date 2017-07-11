import test from 'ava'
import td from '../../helpers/testdouble'

const load = td.replace('../../../src/util/load')
td.when(load.api()).thenResolve({ info: { description: '' } })

test('Returns warning when no description set', async (t) => {
  const warnings = await require('../../../src/doctor/rules/missing-api-description')()
  t.is(warnings.length, 1)
})
