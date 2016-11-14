import test from 'ava'
import { didExec } from '../helpers/exec'

test.before(() => {
  const shep = require('../../src')
  return shep.build({ quiet: true })
})

test(didExec, 'webpack', ['--bail'])
