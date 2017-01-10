import test from 'ava'
import td from '../helpers/testdouble'

const funcName = 'foo'
const handler = 'handler'
const config = { Handler: `index.${handler}` }
const events = [{}]
const lambdaFunc = td.object([handler])
td.when(lambdaFunc[handler](td.matchers.isA(Object), td.matchers.isA(Object))).thenCallback(null, 'bar')

const load = td.replace('../../src/util/load')
td.when(load.lambdaConfig(funcName)).thenReturn(config)
td.when(load.events(funcName, td.matchers.anything())).thenReturn(events)

const requireProject = td.replace('../../src/util/require-project')
td.when(requireProject(td.matchers.contains(funcName))).thenReturn(lambdaFunc)

test.before(() => {
  return require('../../src/run/index')({ name: funcName, build: false })
})

test('Calls the function', () => {
  td.verify(lambdaFunc[handler](), { ignoreExtraArgs: true })
})
