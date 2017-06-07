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
td.when(load.lambdaConfig(functionName)).thenReturn({ FunctionName: functionName })
td.when(load.pkg()).thenReturn(pkg)

const lambda = td.replace('../../src/util/aws/lambda')

test('Gets environment', async (t) => {
  const error = await t.throws(require('../../src/config-dump')({ env: environment, json: true }))
  td.verify(lambda.getEnvironment(environment, td.matchers.isA(Object)))
  t.not(error.message.indexOf('A value undefined was yielded'), -1)
})
