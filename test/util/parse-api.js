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

test('Should check integration type', (t) => {
  const api = {
    paths: {
      '/foo': {
        options: {
          'x-amazon-apigateway-integration': {
            type: 'mock'
          }
        }
      }
    }
  }

  const parsedApi = parseApi(api)
  parsedApi.map(({ uri }) => uri).forEach((uri) => t.falsy(uri))
})
