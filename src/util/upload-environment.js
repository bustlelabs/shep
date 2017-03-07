import Promise from 'bluebird'
import { putEnvironment } from './aws/lambda'
import { lambdaConfig, funcs } from './load'

const pattern = '*'

export default async function (env, vars) {
  const fns = await funcs(pattern)
  return Promise.all(fns.map(async (func) => {
    return await putEnvironment(env, lambdaConfig(func), vars)
  }))
}
