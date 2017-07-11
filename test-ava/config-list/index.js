import test from 'ava'
import td from '../helpers/testdouble'

const pkg = {
  name: 'foo',
  shep: {
    region: 'us-east-1'
  }
}

const environment = 'development'
const functionName = 'bar'
const load = td.replace('../../src/util/load')
td.when(load.funcs()).thenResolve([functionName])
td.when(load.lambdaConfig(functionName), { ignoreExtraArgs: true }).thenReturn({ FunctionName: functionName })
td.when(load.pkg()).thenReturn(pkg)

const lambda = td.replace('../../src/util/aws/lambda')
td.when(lambda.isFunctionDeployed(td.matchers.isA(String)), { ignoreExtraArgs: true }).thenResolve(true)

const getFunctionEnvs = td.replace('../../src/util/get-function-envs')
td.when(getFunctionEnvs(td.matchers.isA(String), td.matchers.isA(Object))).thenResolve({})

const envCheck = td.replace('../../src/util/environment-check')

test('Gets environment', async (t) => {
  await t.throws(require('../../src/config-list')({ env: environment, json: true }))
  td.verify(envCheck.environmentCheck({}))
})
