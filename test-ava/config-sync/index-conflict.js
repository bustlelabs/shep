import test from 'ava'
import td from '../helpers/testdouble'

const pkg = { shep: { region: 'mordor' } }
const fns = ['foo', 'bar']
const fnConfigs = {
  foo: { FunctionName: 'foo' },
  bar: { FunctionName: 'bar' }
}
const fnAliases = {
  foo: [{ Name: 'beta' }, { Name: 'development' }],
  bar: [{ Name: 'beta' }, { Name: 'production' }]
}
const fnEnvs = {
  foo: {
    varOne: 1,
    varTwo: 2
  },
  bar: {
    varOne: 2,
    varThree: 3
  }
}

const load = td.replace('../../src/util/load')
td.when(load.pkg()).thenReturn(pkg)
td.when(load.funcs()).thenResolve(fns)
fns.forEach((name) => {
  td.when(load.lambdaConfig(name), { ignoreExtraArgs: true }).thenReturn(fnConfigs[name])
})

const lambda = td.replace('../../src/util/aws/lambda')
td.when(lambda.isFunctionDeployed(td.matchers.isA(String))).thenResolve(true)
fns.forEach((fnName) => {
  td.when(lambda.listAliases(fnName), { ignoreExtraArgs: true }).thenResolve(fnAliases[fnName])
  fnAliases[fnName].forEach(({ Name }) => {
    td.when(lambda.getEnvironment(Name, { FunctionName: fnName })).thenResolve(fnEnvs[fnName])
  })
  const notValidAlias = (alias) => fnAliases[fnName].map(({ Name }) => Name).indexOf(alias) === -1
  td.when(lambda.getEnvironment(td.matchers.argThat(notValidAlias), { FunctionName: fnName })).thenReject(new Error('Env does not exist'))
})

test('Should throw err', async (t) => {
  const err = await t.throws(require('../../src/config-sync')({ env: 'beta' }))
  t.not(err.message.indexOf('conflicting'), -1)
})
