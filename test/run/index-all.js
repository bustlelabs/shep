import test from 'ava'
import td from '../helpers/testdouble'

const funcNames = ['foo', 'bar']
const handler = 'handler'
const config = { Handler: `index.${handler}` }
const events = [{}]
const lambdaFunc = td.object([handler])
td.when(lambdaFunc[handler](td.matchers.anything(), td.matchers.isA(Object))).thenCallback(null, 'bar')

const load = td.replace('../../src/util/load')
td.when(load.funcs('*')).thenReturn(funcNames)
td.when(load.lambdaConfig(), { ignoreExtraArgs: true }).thenReturn(config)
td.when(load.events(), { ignoreExtraArgs: true }).thenReturn(events)

const requireProject = td.replace('../../src/util/require-project')
td.when(requireProject(td.matchers.contains('events'))).thenReturn({})
td.when(requireProject(td.matchers.contains(`functions`))).thenReturn(lambdaFunc)

test.before(() => {
  return require('../../src/run/index')({ pattern: '*', build: false })
})

test('Calls the functions', () => {
  td.verify(lambdaFunc[handler](), { times: funcNames.length, ignoreExtraArgs: true })
})
