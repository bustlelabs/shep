import test from 'ava'
import td from '../helpers/testdouble'
import Promise from 'bluebird'

const pkg = {
  name: 'foo',
  shep: {
    region: 'us-east-1'
  }
}
const stage = 'development'
const functionName = 'bar'
const callback = td.function('callback')
const getLogResponse = {
  events: [],
  nextLogCall: callback
}

const load = td.replace('../../src/util/load')
td.when(load.pkg()).thenReturn(pkg)

const cloudwatchLogs = td.replace('../../src/util/aws/cloudwatch-logs')
const lambda = td.replace('../../src/util/aws/lambda')

const getLogs = td.replace('../../src/util/get-logs')
td.when(getLogs(), { ignoreExtraArgs: true }).thenReturn(Promise.resolve(getLogResponse))

test.before(() => {
  const shep = require('../../src/index')
  shep.logs({ stage, name: functionName, stream: false })
})

test('Gets alias version', () => {
  td.verify(lambda.getAliasVersion(td.matchers.anything()))
})

test('Gets log group', () => {
  td.verify(cloudwatchLogs.getLogGroup(td.matchers.anything()))
})

