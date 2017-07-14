import Promise from 'bluebird'
import merge from 'lodash.merge'
import { getFunction, updateFunction, doesAliasExist } from './aws/lambda'
import { lambdaConfig, funcs } from './load'

const pattern = '*'

export default async function (env, vars) {
  const configs = await Promise.map(funcs(pattern), async (name) => { return { name, config: await lambdaConfig(name) } })
  return Promise.map(configs, async ({name, config}) => {
    const aliasExists = await doesAliasExist({ FunctionName: config.FunctionName, Alias: env })
    const oldFunc = await getFunction({ FunctionName: config.FunctionName, Qualifier: (aliasExists ? env : undefined) })
    oldFunc.Identifier.Alias = env

    const wantedFunc = { Code: {}, Config: { Environment: {} } }
    wantedFunc.Config.Environment = merge({}, oldFunc.Config.Environment, { Variables: vars })

    return updateFunction(oldFunc, wantedFunc)
  }, { concurrency: 1 })
}
