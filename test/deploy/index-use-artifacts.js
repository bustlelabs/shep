import test from 'ava'
import td from '../helpers/testdouble'

const functions = 'foo-*'
const env = 'beta'
const uploadedFuncs = [null, null]
const bucket = 's3_bucket'
const api = { paths: {} }
const apiId = 'test-id'

const build = td.replace('../../src/util/build-functions')
td.when(build(), { ignoreExtraArgs: true }).thenResolve()
const apiGateway = td.replace('../../src/util/aws/api-gateway')
td.when(apiGateway.deploy(), { ignoreExtraArgs: true }).thenResolve()
const lambda = td.replace('../../src/util/aws/lambda')
td.when(lambda.publishFunction(), { ignoreExtraArgs: true }).thenResolve({})

const setPermissions = td.replace('../../src/util/set-permissions')
td.when(setPermissions(), { ignoreExtraArgs: true }).thenResolve()

const load = td.replace('../../src/util/load')
td.when(load.api()).thenResolve(api)
td.when(load.funcs(td.matchers.isA(String))).thenResolve([])

const push = td.replace('../../src/util/push-api')
td.when(push(api), { ignoreExtraArgs: true }).thenResolve(apiId)

const uploadBuilds = td.replace('../../src/util/upload-builds')
td.when(uploadBuilds(functions, bucket)).thenResolve(uploadedFuncs)

test.before(() => {
  const shep = require('../../src/index')
  return shep.deploy({ env, functions, bucket })
})

test('Builds functions', () => {
  td.verify(build(functions, env))
})

test('Deploys API', () => {
  td.verify(apiGateway.deploy(apiId, env))
})

test('Setup function permissions', () => {
  td.verify(setPermissions(api, apiId, env))
})
