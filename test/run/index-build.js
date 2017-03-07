import test from 'ava'
import td from '../helpers/testdouble'

const funcName = 'foo'
const handler = 'handler'
const config = { Handler: `index.${handler}` }
const events = [{}]
const lambdaFunc = td.object([handler])
td.when(lambdaFunc[handler](td.matchers.anything(), td.matchers.isA(Object))).thenCallback(null, 'bar')

const load = td.replace('../../src/util/load')
td.when(load.funcs(funcName)).thenReturn([funcName])
td.when(load.lambdaConfig(funcName)).thenReturn(config)
td.when(load.events(funcName, td.matchers.anything())).thenReturn(events)

const build = td.replace('../../src/util/build-functions')
td.when(build(funcName, td.matchers.anything())).thenResolve({})

const requireProject = td.replace('../../src/util/require-project')
td.when(requireProject(td.matchers.contains(`dist/${funcName}`))).thenReturn(lambdaFunc)

test.before(async () => {
  return await require('../../src/run/index')({ pattern: funcName, build: true })
})

test('Calls the function', () => {
  td.verify(lambdaFunc[handler](), { ignoreExtraArgs: true })
})

test('Loads event', () => {
  td.verify(requireProject(td.matchers.contains('events')))
})
