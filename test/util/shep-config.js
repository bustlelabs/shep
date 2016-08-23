import test from 'ava'
import { load, update } from '../../src/util/shep-config'
import { create } from '../helpers/fixture'
import fs from 'fs-extra-promise'
import path from 'path'

test.before(() => {
  return create('shep-config')
})

test('Loads all functions', (t) => {
  t.deepEqual(load(), {})
})

test('Updates package.json', (t) => {
  t.plan(1)

  return update({foo: 'bar'}).then(()=>{
    const pkg = fs.readJSONSync(path.join( process.cwd(), 'package.json'))
    t.is(pkg.shep.foo, 'bar')
  })
})
