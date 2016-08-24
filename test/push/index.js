import test from 'ava'
import { create } from '../helpers/fixture'
import td from 'testdouble'
import Promise from 'bluebird'
import fs from 'fs-extra-promise'

td.config({ promiseConstructor: Promise })

let apiGateway

const id = 'newApi'
const response = { id }
const region = 'test'

test.before(() => {
  apiGateway = td.replace('../../src/util/api-gateway')
  td.when(apiGateway.pushApi(td.matchers.contains({swagger: "2.0"}), undefined )).thenResolve(response)

  return create('push')
  .then(() => {
    const push  = require('../../src/push')
    return push({ region })
  })
})

test('Calls API Gateway', ()=>{
  td.verify(apiGateway.pushApi(td.matchers.contains({swagger: "2.0"}), undefined), { times: 1 })
})


test('Updates package.json', t =>{
  t.deepEqual(fs.readJSONSync('package.json').shep, { apiId: id, region })
})
