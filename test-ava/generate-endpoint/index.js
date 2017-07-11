import test from 'ava'
import { fs } from '../helpers/fs'
import td from '../helpers/testdouble'

const generateFunction = td.replace('../../src/generate-function')
td.when(generateFunction(), { ignoreExtraArgs: true }).thenResolve()
const load = td.replace('../../src/util/load')

const path = '/foo'
const method = 'get'
const accountId = 'testid'

td.when(fs.readJSON('package.json')).thenResolve({ name: 'bar', shep: {} })
td.when(fs.writeJSON(), { ignoreExtraArgs: true }).thenResolve()
td.when(load.api()).thenResolve({ paths: {} })

test.before(() => {
  const shep = require('../../src/index')
  return shep.generateEndpoint({ accountId, path, method })
})

test('Writes a new api.json', () => {
  td.verify(fs.writeJSON('api.json'), { ignoreExtraArgs: true })
})

test('Generates a new function', () => {
  td.verify(generateFunction(td.matchers.contains({ name: '/foo get' })))
})
