import test from 'ava'
import td from '../../helpers/testdouble'

const mockApi = {
  paths: {
    '/foo': {
      get: {
        'x-amazon-apigateway-integration': {
          cacheNamespace: 'name'
        }
      },
      put: {
        'x-amazon-apigateway-integration': {
          cacheNamespace: 'name'
        }
      }
    }
  }
}

test.afterEach(() => {
  td.reset()
})

const load = td.replace('../../../src/util/load')

const duplicateCacheNamespaces = require('../../../src/doctor/rules/duplicate-cachenamespaces')

test('No warnings when no api.json', async (t) => {
  td.when(load.api()).thenResolve(null)

  const warnings = await duplicateCacheNamespaces({})
  t.true(Array.isArray(warnings))
  t.is(warnings.length, 0)
})

test('Warns when duplicate namespaces', async (t) => {
  td.when(load.api()).thenResolve(mockApi)
  const warnings = await duplicateCacheNamespaces({})
  t.is(warnings.length, 1)
})
