import test from 'ava'
import { environmentCheck } from '../../src/util/environment-check'

const envs = {
  foo: {
    var1: 1,
    var2: 1
  },
  bar: {
    var1: 1,
    var2: 2,
    var3: 'present'
  }
}

test('Correctly identifies if variables are common, different, or conflicting', (t) => {
  const { common, differences, conflicts } = environmentCheck(envs)

  t.truthy(common['var1'])
  t.truthy(differences['var3'])
  t.truthy(conflicts['var2'])

  t.is(common['var1'], envs.foo['var1'])
  t.is(differences['var3'].value, envs.bar['var3'])
  t.is(conflicts['var2'].foo, envs.foo['var2'])
  t.falsy(conflicts['var2'].foo['var1'])
  t.falsy(conflicts['var2'].bar['var1'])
  t.is(conflicts['var2'].bar, envs.bar['var2'])
})
