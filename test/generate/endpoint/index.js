import test from 'ava'
import { create } from '../../helpers/fixture'
import generateEndpoint from '../../../src/generate/endpoint'
import { mapping } from '../../../src/generate/endpoint/templates'
import fs from 'fs-extra-promise'
import dirExists from '../../helpers/dir-exists'

test.before(() => {
  return create('generate-endpoint')
})

test.serial('generate an endpoint without a function', (t) => {
  return generateEndpoint({ createFunction: false, path: '/foo', functionName: 'foo' })
  .then(()=> fs.readJSONAsync('api.json'))
  .then((api) => {
    t.truthy(api.paths['/foo'])
    t.truthy(api.paths['/foo'].get)

    const endpoint = api.paths['/foo'].get
    const integration = endpoint['x-amazon-apigateway-integration']

    t.truthy(integration)
    t.truthy(integration.requestTemplates)

    t.is(endpoint.consumes[0], 'application/json')
    t.is(endpoint.produces[0], 'application/json')

    t.is(integration.requestTemplates['application/json'], mapping())
    t.regex(integration.uri, /function:foo/)
  })
})

test.serial('generate an endpoint with a function', (t) =>{
  return generateEndpoint({ createFunction: true, path: '/bar', functionName: 'bar' })
  .then(()=> fs.readJSONAsync('api.json'))
  .then((api) => {
    t.truthy(api.paths['/bar'])
    t.truthy(dirExists(`functions/bar`))
  })
})
