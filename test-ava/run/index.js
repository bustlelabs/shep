import path from 'path'
import test from 'ava'
import td from '../helpers/testdouble'

const funcName = 'foo'
const handler = 'handler'
const config = { Handler: `index.${handler}` }
const events = ['event']
const lambdaFunc = td.object([handler])
td.when(lambdaFunc[handler](td.matchers.anything(), td.matchers.isA(Object))).thenCallback(null, 'bar')

const load = td.replace('../../src/util/load')
load.distPath = async (joinPath) => joinPath ? path.join('dist', joinPath) : 'dist'
td.when(load.funcs(funcName)).thenResolve([funcName])
td.when(load.lambdaConfig(funcName)).thenResolve(config)
td.when(load.events(funcName, td.matchers.anything())).thenResolve(events)

const requireProject = td.replace('../../src/util/require-project')
td.when(requireProject(td.matchers.contains(`functions/${funcName}`))).thenReturn(lambdaFunc)

test.before(() => {
  return require('../../src/run/index')({ pattern: funcName, build: false })
})

test('Calls the function', () => {
  td.verify(lambdaFunc[handler](), { ignoreExtraArgs: true })
})

test('Loads event', () => {
  td.verify(requireProject(td.matchers.contains('events')))
})
