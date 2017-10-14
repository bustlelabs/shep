import test from 'ava'
import { fs } from '../helpers/fs'
import td from '../helpers/testdouble'

const generateFunction = td.replace('../../src/generate-function')
td.when(generateFunction(), { ignoreExtraArgs: true }).thenResolve()
const load = td.replace('../../src/util/load')

const path = '/foo'
const method = 'get'
const accountId = 'testid'

let shep

td.when(fs.readJSON('package.json')).thenResolve({ name: 'bar', shep: {} })
td.when(fs.writeJSON(), { ignoreExtraArgs: true }).thenResolve()

const functionName = 'noice-name-bro'
const generateName = td.replace('../../src/util/generate-name')
td.when(generateName(), { ignoreExtraArgs: true }).thenResolve({
  fullName: functionName
})

test.before(async () => {
  shep = require('../../src/index')
})

test.beforeEach((t) => {
  t.context.paths = {}

  td.when(load.api()).thenResolve({ paths: t.context.paths })
})

test('Writes a new api.json file', async () => {
  await shep.generateEndpoint({ accountId, path, method })

  td.verify(fs.writeJSON('api.json'), { ignoreExtraArgs: true })
})

test('Generates a new function', async () => {
  await shep.generateEndpoint({ accountId, path, method })
  td.verify(generateFunction(td.matchers.contains({ name: '/foo get' })))
})

const integration = 'x-amazon-apigateway-integration'

const constructIntegrationObject = (accountId, region) => ({
  uri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${region}:${accountId}:function:${functionName}:\${stageVariables.functionAlias}/invocations`,
  passthroughBehavior: 'when_no_match',
  httpMethod: 'POST',
  type: 'aws_proxy'
})

test('adds a basic api path', async (t) => {
  const region = 'us-west-2'

  await shep.generateEndpoint({ accountId, path, method, region })

  t.deepEqual(t.context.paths[path][method][integration], constructIntegrationObject(accountId, region))
})

test('defaults to us-east-1 region', async (t) => {
  await shep.generateEndpoint({ accountId, path, method })

  t.deepEqual(t.context.paths[path][method][integration], constructIntegrationObject(accountId, 'us-east-1'))
})
