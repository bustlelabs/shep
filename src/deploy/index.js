import Promise from 'bluebird'
import buildFuncs from '../util/build-functions'
import upload from '../util/upload-functions'
import uploadBuilds from '../util/upload-builds'
import { deploy } from '../util/aws/api-gateway'
import setPermissions from '../util/set-permissions'
import * as load from '../util/load'
import push from '../util/push-api'

export default async function ({ apiId, api: deployApi = true, functions = '*', env = 'development', region, bucket, build = true, logger = () => {}, quiet }) {
  const api = await load.api()

  let uploadFuncs, aliases

  try {
    if (build) {
      logger({ type: 'start', body: `Build Functions` })
      await buildFuncs(functions, env, { quiet })
    } else {
      logger({ type: 'skip', body: 'Called with --no-build' })
    }

    if (bucket) {
      logger({ type: 'start', body: `Upload Builds to S3` })
      const funcs = await uploadBuilds(functions, bucket)
      uploadFuncs = funcs
    } else {
      logger({ type: 'skip', body: 'Skipping uploading builds, no S3 bucket provided' })
      uploadFuncs = await Promise.map(load.funcs(functions), (name) => { return { name } })
    }

    logger({ type: 'start', body: 'Upload Functions to AWS' })
    aliases = await upload(uploadFuncs, env)

    if (deployApi && api) {
      logger({ type: 'start', body: 'Upload API.json' })
      apiId = await push(api, apiId, region)
    } else {
      logger({ type: 'skip', body: 'No API' })
    }

    if (api) {
      logger({ type: 'start', body: 'Setup Lambda Permissions' })
      await setPermissions(api, apiId, env)
      if (deployApi) {
        logger({ type: 'start', body: 'Deploy API' })
        await deploy(apiId, env)
      }
    } else {
      logger({ type: 'skip', body: 'No API' })
    }
  } catch (e) {
    logger({ type: 'fail' })
    throw e
  }

  logger({ type: 'done' })

  aliases.map(({ FunctionName, Identifier }) => `Deployed version ${Identifier.Version} for ${FunctionName}`).forEach((n) => logger(n))
  if (apiId) { logger(`API URL: https://${apiId}.execute-api.${region}.amazonaws.com/${env}`) }
  return `https://${apiId}.execute-api.${region}.amazonaws.com/${env}`
}
