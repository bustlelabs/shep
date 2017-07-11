import test from 'ava'
import td from '../../helpers/testdouble'

const api = {
  paths: {
    '/foo': {
      get: {
        'x-amazon-apigateway-integration': {
          uri: 'has no alias'
        }
      },
      post: {
        'x-amazon-apigateway-integration': {
          uri: '${stageVariables.functionAlias}' // eslint-disable-line no-template-curly-in-string
        }
      }
    }
  }
}

const load = td.replace('../../../src/util/load')
td.when(load.api()).thenResolve(api)

test('Reports unaliased endpoints', async (t) => {
  const warnings = await require('../../../src/doctor/rules/unaliased-uri')()
  t.is(warnings.length, 1)
})
