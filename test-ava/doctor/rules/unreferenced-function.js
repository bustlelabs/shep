import test from 'ava'
import td from '../../helpers/testdouble'

const funcs = ['foo', 'bar']

const load = td.replace('../../../src/util/load')

const unreferencedFunction = require('../../../src/doctor/rules/unreferenced-function')

test.afterEach(() => td.reset())

test('Should report missing functions', async (t) => {
  const api = { paths: {} }
  td.when(load.api()).thenResolve(api)
  td.when(load.funcs(), { ignoreExtraArgs: true }).thenResolve(funcs)
  td.when(load.lambdaConfig('foo'), { ignoreExtraArgs: true }).thenResolve({ FunctionName: 'test-foo' })
  td.when(load.lambdaConfig('bar'), { ignoreExtraArgs: true }).thenResolve({ FunctionName: 'test-bar' })

  const warnings = await unreferencedFunction({})
  t.is(warnings.length, funcs.length)
})

test('Should be quiet when missing api', async (t) => {
  td.when(load.api()).thenResolve(null)
  const warnings = await unreferencedFunction({})
  t.deepEqual(warnings, [])
})

test('Should report difference', async (t) => {
  const uri = ':test-foo:'
  const api = { paths: { '/foo': { 'get': { 'x-amazon-apigateway-integration': { uri, type: 'aws_proxy' } } } } }
  td.when(load.api()).thenResolve(api)
  td.when(load.funcs(), { ignoreExtraArgs: true }).thenResolve(funcs)
  td.when(load.lambdaConfig('foo'), { ignoreExtraArgs: true }).thenResolve({ FunctionName: 'test-foo' })
  td.when(load.lambdaConfig('bar'), { ignoreExtraArgs: true }).thenResolve({ FunctionName: 'test-bar' })

  const warnings = await unreferencedFunction({})
  t.is(warnings.length, 1)
})
