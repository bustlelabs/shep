import test from 'ava'
import td from '../helpers/testdouble'
import { fs } from '../helpers/fs'

const apiId = 'foo'
const region = 'test'
const api = {
  swagger: '2.0',
  paths: {}
}

const apiGateway = td.replace('../../src/util/aws/api-gateway')
const pkgConfig = td.replace('../../src/util/pkg-config')

td.when(fs.readJSON('api.json')).thenResolve(api)
td.when(apiGateway.pushApi(td.matchers.isA(Object), undefined)).thenResolve(apiId)
td.when(pkgConfig.update({ apiId, region })).thenResolve()

test('No errrors', (t) => {
  const shep = require('../../src')
  t.notThrows(shep.push({ region, quiet: true }))
})
