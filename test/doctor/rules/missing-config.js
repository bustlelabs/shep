import test from 'ava'
import td from '../../helpers/testdouble'

const funcs = ['foo', 'bar']

const load = td.replace('../../../src/util/load')
td.when(load.funcs('*')).thenReturn(funcs)
td.when(load.lambdaConfig(), { ignoreExtraArgs: true }).thenReturn({})

test('Reports missing description for lambda configs', (t) => {
  const warnings = require('../../../src/doctor/rules/missing-config')()
  t.is(warnings.length, funcs.length)
})
