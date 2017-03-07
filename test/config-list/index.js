import test from 'ava'
import td from '../helpers/testdouble'
import Promise from 'bluebird'

const pkg = {
  name: 'foo',
  shep: {
    region: 'us-east-1'
  }
}
const getEnvironmentResponse = [{
  KEY: 'VALUE'
}]
const environment = 'development'
const functionName = 'bar'
const load = td.replace('../../src/util/load')
td.when(load.lambdaConfig()).thenReturn(pkg)

const getEnvironment = td.replace('../../src/util/get-environment')
td.when(getEnvironment(environment, functionName)).thenReturn(Promise.resolve(getEnvironmentResponse))

test.before(async () => {
  return await require('../../src/config-list/index')({ env: environment, function: functionName })
})

test('Gets environment', () => {
  td.verify(getEnvironment(environment, functionName))
})
