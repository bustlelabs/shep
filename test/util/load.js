import test from 'ava'
import * as load from '../../src/util/load'

test.before(() => process.chdir('./test/fixtures'))

test('Loads environments', async (t) => {
  const envs = await load.envs()

  t.deepEqual(envs, [ ])
})

test('Loads functions', async (t) => {
  const funcs = await load.funcs()
  t.deepEqual(funcs.sort(), [ 'bar', 'foo' ])
})

test('Loads functions by pattern', async (t) => {
  const funcs = await load.funcs('f*')
  t.deepEqual(funcs, [ 'foo' ])
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
