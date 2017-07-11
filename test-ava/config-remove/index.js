import test from 'ava'
import td from '../helpers/testdouble'

const pkg = {
  name: 'foo',
  shep: {
    region: 'us-east-1'
  }
}
const environment = 'development'
const envVars = ['KEY', 'KEY2']
const load = td.replace('../../src/util/load')
td.when(load.lambdaConfig()).thenReturn(pkg)

const removeEnvironment = td.replace('../../src/util/remove-environment')

test.before(async () => {
  return require('../../src/config-remove/index')({ env: environment, vars: envVars })
})

test('Calls removeEnvironment', () => {
  td.verify(removeEnvironment(environment, envVars))
})
