import test from 'ava'
import td from '../../helpers/testdouble'

const funcs = ['foo', 'bar']

const load = td.replace('../../../src/util/load', td.object(['funcs', 'api', 'pkg']))
td.when(load.funcs('*')).thenReturn(funcs)
td.when(load.pkg()).thenReturn({ name: 'test' })

const unreferencedFunction = require('../../../src/doctor/rules/unreferenced-function')

test('Should report missing functions', (t) => {
  const api = { paths: {} }
  td.when(load.api()).thenReturn(api)

  const warnings = unreferencedFunction({})
  t.is(warnings.length, funcs.length)
})

test('Should be quiet when missing api', (t) => {
  td.when(load.api()).thenReturn(null)
  const warnings = unreferencedFunction({})
  t.deepEqual(warnings, [])
})

test('Should report difference', (t) => {
  const uri = ':test-foo:'
  const api = { paths: { '/foo': { 'get': { 'x-amazon-apigateway-integration': { uri, type: 'aws_proxy' } } } } }
  td.when(load.api()).thenReturn(api)

  t.is(unreferencedFunction({}).length, 1)
})
