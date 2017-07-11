import Promise from 'bluebird'
import zipDir from './zip-dir'
import { putFunction } from './aws/lambda'
import { lambdaConfig, distPath } from './load'

export default async function (fns, env) {
  return Promise.map(fns, async (func) => {
    const zip = await zipDir(await distPath(func))
    const config = await lambdaConfig(func)
    return putFunction(env, config, zip)
  })
}
