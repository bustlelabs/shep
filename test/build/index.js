import test from 'ava'
import { exec, didExec } from '../helpers/exec'
import td from '../helpers/testdouble'

td.when(exec('webpack --bail'), { ignoreExtraArgs: true }).thenReturn(Promise.resolve())

test.before(() => {
  const shep = require('../../src')
  return shep.build({ quiet: true })
})

test(didExec, 'webpack --bail')
