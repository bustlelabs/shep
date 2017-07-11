import test from 'ava'
import execa from 'execa'

test('it runs', () => {
  return execa('./cli.js', ['--help'])
})
