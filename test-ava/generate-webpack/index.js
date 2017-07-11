import test from 'ava'
import { wroteFile } from '../helpers/fs'
import generateWebpack from '../../src/generate-webpack'

const output = 'foo'

test.before(() => {
  return generateWebpack({ output })
})

test(wroteFile, output)
