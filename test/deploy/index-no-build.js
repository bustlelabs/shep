import test from 'ava'
import td from '../helpers/testdouble'

const functions = 'foo-*'
const uploadedFuncs = ['foo', 'bar']
const env = 'beta'
const bucket = 's3_bucket'
const api = { paths: {} }
const apiId = 'test-id'

const build = td.replace('../../src/util/build-functions')
td.when(build(), { ignoreExtraArgs: true }).thenResolve()
const apiGateway = td.replace('../../src/util/aws/api-gateway')
td.when(apiGateway.deploy(), { ignoreExtraArgs: true }).thenResolve()
const promoteAliases = td.replace('../../src/util/promote-aliases')
td.when(promoteAliases(), { ignoreExtraArgs: true }).thenResolve()
const setPermissions = td.replace('../../src/util/set-permissions')
td.when(setPermissions(), { ignoreExtraArgs: true }).thenResolve()

const load = td.replace('../../src/util/load')
td.when(load.api()).thenResolve(api)

const push = td.replace('../../src/util/push-api')
td.when(push(api), { ignoreExtraArgs: true }).thenResolve(apiId)

const uploadBuilds = td.replace('../../src/util/upload-builds')
td.when(uploadBuilds(functions, bucket)).thenResolve(uploadedFuncs)

const upload = td.replace('../../src/util/upload-functions')
td.when(upload(uploadedFuncs, env)).thenResolve(uploadedFuncs)

test.before(() => {
  const shep = require('../../src/index')
  return shep.deploy({ build: false, bucket, env, functions })
})

test('Builds functions', () => {
  td.verify(build(), { times: 0, ignoreExtraArgs: true })
})

test('Deploys API', () => {
  td.verify(apiGateway.deploy(apiId, env))
})

test('Promote function aliases', () => {
  td.verify(promoteAliases(functions, env))
})

test('Setup function permissions', () => {
  td.verify(setPermissions(api, apiId, env))
})
