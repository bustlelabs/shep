import test from 'ava'
import Promise from 'bluebird'
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
td.when(iam.getRole(rolename)).thenReturn(Promise.reject({ code: 'NoSuchEntity' }))
td.when(iam.createRole(rolename)).thenReturn(Promise.resolve(roleArn))

test.before(() => {
  const shep = require('../../src/index')
  return shep.new({ region, rolename, path, quiet: true })
})

test('Creates role and writes configured templates', () => {
  td.verify(fs.writeFile(), { ignoreExtraArgs: true })
  td.verify(exec(), { ignoreExtraArgs: true })
  td.verify(templates.pkg({ apiName: path, region, accountId }))
  td.verify(templates.lambda(roleArn))
  td.verify(iam.attachPolicy(rolename))
})
