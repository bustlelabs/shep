import test from 'ava'
import parseApi from '../../src/util/parse-api'
import { isArray } from 'util'

const mockApi = {
  paths: {
    '/foo': {
      get: {
        'x-amazon-apigateway-integration': {
          uri: 'some-lambda-arn',
          type: 'aws_proxy'
        }
      },
      post: {
        'x-amazon-apigateway-integration': {
          uri: 'some-other-labmda-arn',
          type: 'aws_proxy'
        }
      }
    }
  }
}

test('Should return array', (t) => {
  t.true(isArray(parseApi()))
  t.true(isArray(parseApi(mockApi)))
})

test('Should handle multiple http methods correctly', (t) => {
  const api = parseApi(mockApi)
  api.map(({ path }) => path).forEach((path) => t.is(path, '/foo'))
  t.deepEqual(api.map(({ method }) => method), ['get', 'post'])
})

test('Should pass entire integration', (t) => {
  const apiIntegration = { type: 'mock' }
  const api = {
    paths: {
      '/foo': {
        options: {
          'x-amazon-apigateway-integration': apiIntegration
        }
      }
    }
  }

  const parsedApi = parseApi(api)
  parsedApi.map(({ integration }) => integration).forEach((integration) => t.deepEqual(integration, apiIntegration))
})
