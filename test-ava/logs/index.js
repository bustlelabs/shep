import test from 'ava'
import td from '../helpers/testdouble'

const pkg = {
  name: 'foo',
  shep: {
    region: 'us-east-1'
  }
}
const env = 'development'
const functionName = 'bar'
const callback = td.function('callback')
const getLogResponse = {
  events: [],
  nextLogCall: callback
}

const load = td.replace('../../src/util/load')
td.when(load.pkg()).thenResolve(pkg)
td.when(load.lambdaConfig(functionName, env)).thenResolve({ FunctionName: functionName })

const cloudwatchLogs = td.replace('../../src/util/aws/cloudwatch-logs')
td.when(cloudwatchLogs.getLogGroup(td.matchers.contains({ FunctionName: functionName }))).thenResolve('/aws/log/group')

const lambda = td.replace('../../src/util/aws/lambda')
td.when(lambda.getAliasVersion(td.matchers.contains({ aliasName: env }))).thenResolve('1')

const getLogs = td.replace('../../src/util/get-logs')
td.when(getLogs(td.matchers.isA(Object))).thenResolve(getLogResponse)

test('Continues loop', async (t) => {
  const shep = require('../../src/index')
  await t.throws(shep.logs({ env, name: functionName, stream: true }))
  td.verify(callback(td.matchers.isA(Number)))
})
