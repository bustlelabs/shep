import test from 'ava'
import td from '../helpers/testdouble'
import path from 'path'

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

const build = td.replace('../../src/util/build-functions')
td.when(build(funcName, td.matchers.anything())).thenResolve({})

const requireProject = td.replace('../../src/util/require-project')
td.when(requireProject(td.matchers.contains(`dist/${funcName}`))).thenReturn(lambdaFunc)

test.before(async () => {
  return require('../../src/run/index')({ pattern: funcName, build: true })
})

test('Calls the function', () => {
  td.verify(lambdaFunc[handler](), { ignoreExtraArgs: true })
})

test('Loads event', () => {
  td.verify(requireProject(td.matchers.contains('events')))
})
