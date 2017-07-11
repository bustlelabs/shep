import test from 'ava'
import td from '../helpers/testdouble'
import { fs } from '../helpers/fs'

const response = '{ "foo": "bar" }'
const apiId = 'test'
const stage = 'prod'
const region = 'east'

const apiGateway = td.replace('../../src/util/aws/api-gateway')
const pkgConfig = td.replace('../../src/util/pkg-config')

td.when(apiGateway.exportStage(apiId, stage)).thenResolve(response)
td.when(fs.writeFile(), { ignoreExtraArgs: true }).thenResolve()
td.when(pkgConfig.update(), { ignoreExtraArgs: true }).thenResolve()

test.before(() => {
  const shep = require('../../src')
  return shep.pull({ apiId, region, stage })
})

test('Writes api.json', () => {
  td.verify(fs.writeFile('api.json', response, td.matchers.isA(Object)))
})

test('Updates package.json', () => {
  td.verify(pkgConfig.update({apiId, region}))
})
