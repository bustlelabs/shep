import test from 'ava'
import { exec, didExec } from '../helpers/exec'
import td from '../helpers/testdouble'

const buildCommand = 'custom-build --cool-flag -x 6'

const load = td.replace('../../src/util/load')
td.when(load.pkg()).thenReturn({ shep: { buildCommand } })

td.when(exec(), { ignoreExtraArgs: true }).thenReturn(Promise.resolve())

test.before(() => {
  const shep = require('../../src')
  return shep.build({ quiet: true })
})

test(didExec, buildCommand)
