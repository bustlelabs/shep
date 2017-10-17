import Promise from 'bluebird'
import merge from 'lodash.merge'
import { updateFunction, getFunction, isFunctionDeployed, doesAliasExist, createFunction } from './aws/lambda'
import { lambdaConfig, distPath } from './load'
import zipDir from './zip-dir'

export default async function (fns, env) {
  return Promise.map(fns, async ({ name, key, bucket }) => {
    const config = await lambdaConfig(name)
    let wantedFunc = { Config: config, Code: {}, Identifier: {} }

    if (bucket && key) {
      wantedFunc.Code.s3 = { bucket, key }
    } else {
      const path = await distPath(name)
      wantedFunc.Code.Zip = await zipDir(path)
    }

    if (await isFunctionDeployed(config.FunctionName)) {
      const aliasExists = await doesAliasExist({ FunctionName: config.FunctionName, Alias: env })
      const oldFunc = await getFunction({ FunctionName: config.FunctionName, Qualifier: aliasExists ? env : undefined })
      if (!aliasExists) { wantedFunc.Identifier.Alias = env }
      wantedFunc.Config.Environment = merge({}, oldFunc.Config.Environment, wantedFunc.Config.Environment)
      return updateFunction(oldFunc, wantedFunc)
    } else {
      wantedFunc.FunctionName = config.FunctionName
      wantedFunc.Alias = env
      wantedFunc.Config = config
      return createFunction(wantedFunc)
    }
  })
}
