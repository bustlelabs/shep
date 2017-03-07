import { getEnvironment } from './aws/lambda'
import { lambdaConfig, funcs } from './load'

export default async function (env, name) {
  const fns = await funcs(name)
  return Promise.all(fns.map(async (func) => {
    return await getEnvironment(env, lambdaConfig(func))
  }))
}
