import test from 'ava'
import * as load from '../../src/util/load'

test.before(() => process.chdir('./test/fixtures'))

test('Loads environemnts', (t) => {
  t.deepEqual(load.envs().sort(), [ 'beta', 'prod' ])
})

test('Loads functions', (t) => {
  t.deepEqual(load.funcs().sort(), [ 'bar', 'foo' ])
})

test('Loads functions by pattern', (t) => {
  t.deepEqual(load.funcs('f*'), [ 'foo' ])
})

test('Loads function events', (t) => {
  t.deepEqual(load.events('foo').sort(), [ 'custom.json', 'default.json' ])
})

test('Loads lambda config', (t) => {
  const config = load.lambdaConfig('foo')
  t.is(config.Name, 'foo')
  t.is(config.Role, 'admin')
  t.is(config.Memory, 5)
})

test('Is ok with no api config', (t) => {
  const config = load.api()
  t.is(config, null)
})
