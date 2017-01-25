import test from 'ava'
import td from '../helpers/testdouble'
import { createdDir, wroteFile } from '../helpers/fs'
import { didExec } from '../helpers/exec'

const path = 'foo-api'
const iam = td.replace('../../src/util/aws/iam')

test.before(() => {
  const shep = require('../../src/index')
  return shep.new({ path, quiet: true })
})

test('No calls to AWS if no rolename', () => {
  td.verify(iam.getRole(), { times: 0, ignoreExtraArgs: true })
  td.verify(iam.createRole(), { times: 0, ignoreExtraArgs: true })
})

test(createdDir, `${path}/functions`)
test(createdDir, `${path}/functions`)
test(createdDir, `${path}/environments`)

test(wroteFile, `${path}/lambda.json`)
test(wroteFile, `${path}/api.json`)
test(wroteFile, `${path}/package.json`)
test(wroteFile, `${path}/.gitignore`)
test(wroteFile, `${path}/README.md`)
test(wroteFile, `${path}/webpack.config.js`)

test(didExec, 'npm install')

