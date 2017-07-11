import test from 'ava'
import { fs } from '../helpers/fs'
import { exec } from '../helpers/exec'
import td from '../helpers/testdouble'

const rolename = 'fooRole'
const region = 'us-east-1'
const path = 'foo-path'
const accountId = '123412341234'
const roleArn = `arn:aws:iam:${accountId}:role/${rolename}`
const templates = td.replace('../../src/new/templates')
const iam = td.replace('../../src/util/aws/iam')
td.when(iam.getRole(rolename)).thenResolve(roleArn)
td.when(fs.exists(td.matchers.isA(String))).thenResolve(false)

test.before(() => {
  const shep = require('../../src/index')
  return shep.new({ region, rolename, path, quiet: true })
})

test('If role is found, no role is created', () => {
  td.verify(iam.createRole(), { times: 0, ignoreExtraArgs: true })
  td.verify(iam.attachPolicy(), { times: 0, ignoreExtraArgs: true })
  td.verify(fs.writeFile(), { ignoreExtraArgs: true })
  td.verify(exec(), { ignoreExtraArgs: true })
})

test('Wrote configured templates', () => {
  td.verify(templates.pkg({ apiName: path, region, accountId }))
  td.verify(templates.lambda(roleArn))
})
