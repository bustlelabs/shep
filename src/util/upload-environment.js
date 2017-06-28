import Promise from 'bluebird'
import merge from 'lodash.merge'
import { putEnvironment } from './aws/lambda'
import { lambdaConfig, funcs } from './load'

const pattern = '*'

export default async function (env, vars) {
  const configs = await Promise.map(funcs(pattern), async (name) => { return { name, config: await lambdaConfig(name) } })
  return Promise.map(configs, async ({name, config}) => {
    const alias = await putEnvironment(env, config, vars)
    return merge({ name }, alias)
  }, { concurrency: 1 })
}
