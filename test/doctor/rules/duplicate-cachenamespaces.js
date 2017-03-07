import test from 'ava'
import td from '../../helpers/testdouble'
import { isArray } from 'util'

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

const load = td.replace('../../../src/util/load', td.object(['api']))

const duplicateCacheNamespaces = require('../../../src/doctor/rules/duplicate-cachenamespaces')

test('No warnings when no api.json', (t) => {
  const warnings = duplicateCacheNamespaces({})
  t.true(isArray(warnings))
  t.is(warnings.length, 0)
})

test('Warns when duplicate namespaces', (t) => {
  td.when(load.api()).thenReturn(mockApi)
  t.is(duplicateCacheNamespaces({}).length, 1)
})
