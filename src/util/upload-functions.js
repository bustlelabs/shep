import Promise from 'bluebird'
import zipDir from './zip-dir'
import { putFunction } from './aws/lambda'
import { lambdaConfig, funcs } from './load'

export default function (pattern, env) {
  return Promise.resolve(funcs(pattern))
  .map((func) => {
    return Promise.join(
      env,
      lambdaConfig(func),
      zipDir(`dist/${func}`),
      putFunction
    )
  })
}
