import test from 'ava'
import { exec } from '../helpers/exec'
import td from '../helpers/testdouble'

let error = new Error()
error.code = 'ENOENT'

td.when(exec('webpack --bail'), { ignoreExtraArgs: true }).thenReject(error)
td.replace(console, 'warn')

test('Logs to console when no webpack found', async (t) => {
  const shep = require('../../src')
  const error = await t.throws(shep.build({ quiet: true }))
  t.is(error.code, 'ENOENT')
  td.verify(console.warn(), { ignoreExtraArgs: true })
})

