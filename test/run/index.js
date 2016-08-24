import test from 'ava'
import { create } from '../helpers/fixture'
import generateFunction from '../../src/generate/function'
import td from 'testdouble'
import Promise from 'bluebird'
import run from '../../src/run'

// Supress observetory output
require('observatory').settings({ write: () => {} })

td.config({ promiseConstructor: Promise })

test.before(() => {
  return create('run')
  .then(() => generateFunction({ name: 'foo' }) )
  .then(() => generateFunction({ name: 'bar' }) )
})

test('Calls the function', (t)=>{
  t.truthy(run({ name: 'foo', build: true }))
})

test('Throws an exception for an event that does not exist', (t)=>{
  t.throws(() => run({ name: 'foo', build: true, event: 'doesnotexist' }))
})

test('Throws an exception for unbuilt function', (t)=>{
  t.throws(run({ name: 'bar', build: false }))
})
