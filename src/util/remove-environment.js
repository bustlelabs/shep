import Promise from 'bluebird'
import merge from 'lodash.merge'
import { getFunction, updateFunction } from './aws/lambda'
import { lambdaConfig, funcs } from './load'
import { AWSEnvironmentVariableNotFound } from './errors'

const pattern = '*'

export default async function (env, vars) {
  const configs = await Promise.map(funcs(pattern), async (name) => { return { name, config: await lambdaConfig(name, env) } })
  return Promise.map(configs, async ({ name, config }) => {
    const oldFunc = await getFunction({ FunctionName: config.FunctionName, Qualifier: env })
    const wantedFunc = merge({}, oldFunc)

    return updateFunction(oldFunc, deleteEnvVars(wantedFunc, vars))
  }, { concurrency: 1 })
}

function deleteEnvVars (func, envVars) {
  envVars.forEach((envVar) => {
    try {
      delete func.Config.Environment.Variables[envVar]
    } catch (e) {
      throw new AWSEnvironmentVariableNotFound(func.FunctionName, envVar)
    }
  })
  return func
}
