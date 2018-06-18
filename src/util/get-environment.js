import Promise from 'bluebird'
import { getEnvironment } from './aws/lambda'
import { lambdaConfig, funcs } from './load'

export default async function (env, name) {
  const configs = await Promise.map(funcs(name), (func) => lambdaConfig(func, env))
  return Promise.map(configs, (config) => getEnvironment(env, config))
}
