import buildFuncs from '../util/build-functions'
import upload from '../util/upload-functions'
import uploadBuilds from '../util/upload-builds'
import { deploy } from '../util/aws/api-gateway'
import promoteAliases from '../util/promote-aliases'
import setPermissions from '../util/set-permissions'
import * as load from '../util/load'
import push from '../util/push-api'

export default async function ({ apiId, functions = '*', env = 'development', region, bucket, build = true, logger = () => {} }) {
  const api = await load.api()

  let uploadFuncs
  let shouldUpload = true

  try {
    if (build) {
      logger({ type: 'start', body: `Build Functions` })
      await buildFuncs(functions, env)
    } else {
      logger({ type: 'skip', body: 'Called with --no-build' })
    }

    if (bucket) {
      logger({ type: 'start', body: `Upload Builds to S3` })
      const funcs = await uploadBuilds(functions, bucket)
      // delete null keys from fns without s3 builds, then set other fns to be uploaded

      Object.keys(funcs).forEach((key) => (funcs[key] == null) && delete funcs[key])

      if (Object.keys(funcs).length === 0) { shouldUpload = false }
      uploadFuncs = funcs
    } else {
      logger({ type: 'skip', body: 'Skipping uploading builds, no S3 bucket provided' })
      uploadFuncs = await load.funcs(functions)
    }

    if (shouldUpload) {
      logger({ type: 'start', body: 'Upload Functions to AWS' })
      await upload(uploadFuncs, env)
    } else {
      logger({ type: 'skip', body: 'Skipping upload, function unchanged since last deploy' })
    }

    if (api) {
      logger({ type: 'start', body: 'Upload API.json' })
      apiId = await push(api, apiId, region)
    } else {
      logger({ type: 'skip', body: 'No API' })
    }

    logger({ type: 'start', body: 'Promote Function Aliases' })
    await promoteAliases(functions, env)

    if (api) {
      logger({ type: 'start', body: 'Setup Lambda Permissions' })
      await setPermissions(api, apiId, env)

      logger({ type: 'start', body: 'Deploy API' })
      await deploy(apiId, env)
    } else {
      logger({ type: 'skip', body: 'No API' })
      logger({ type: 'skip', body: 'No API' })
    }
  } catch (e) {
    logger({ type: 'fail', body: e })
    throw e
  }

  logger({ type: 'done' })

  if (apiId) { logger(`API URL: https://${apiId}.execute-api.${region}.amazonaws.com/${env}`) }
  return `https://${apiId}.execute-api.${region}.amazonaws.com/${env}`
}
