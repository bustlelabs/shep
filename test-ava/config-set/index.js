import test from 'ava'
import td from '../helpers/testdouble'

const pkg = {
  name: 'foo',
  shep: {
    region: 'us-east-1'
  }
}
const environment = 'development'
const envVars = {
  KEY: 'VALUE',
  KEY2: 'VALUE2'
}
const load = td.replace('../../src/util/load')
td.when(load.lambdaConfig()).thenReturn(pkg)

const uploadEnvironment = td.replace('../../src/util/upload-environment')

test.before(async () => {
  return require('../../src/config-set/index')({ env: environment, vars: envVars })
})

test('Calls uploadEnvironment', () => {
  td.verify(uploadEnvironment(environment, envVars))
})
