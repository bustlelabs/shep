import test from 'ava'
import td from '../../helpers/testdouble'

const funcs = ['foo', 'bar']

const load = td.replace('../../../src/util/load')
td.when(load.funcs('*')).thenResolve(funcs)
td.when(load.lambdaConfig(), { ignoreExtraArgs: true }).thenResolve({})

test('Reports missing description for lambda configs', async (t) => {
  const warnings = await require('../../../src/doctor/rules/missing-config')()
  t.is(warnings.length, funcs.length)
})
