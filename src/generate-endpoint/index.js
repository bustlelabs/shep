import generateFunction from '../generate-function'
import { DuplicateEndpointError } from '../util/errors'
import { writeJSON } from '../util/modules/fs'
import { cors } from './templates'
import genName from '../util/generate-name'
import * as load from '../util/load'
const { MissingShepConfiguration } = load

const integration = 'x-amazon-apigateway-integration'

export default async function ({ accountId, path, method, region, logger = () => {} }) {
  if (!accountId) {
    throw new MissingShepConfiguration('Unable to determine your AWS Account ID. Please set it in the `shep` section of package.json')
  }

  const api = await load.api() || {}

  const name = `${path} ${method}`
  const { shortName, fullName } = await genName(name)

  try {
    logger({ type: 'start', body: `Generate Function ${shortName}` })
    await generateFunction({ name, quiet: true })

    logger({ type: 'start', body: 'Setup Endpoint' })
    addPath(api, path, method, accountId, fullName, region)

    logger({ type: 'start', body: 'Setup CORS' })
    setupCORS(api, path)

    logger({ type: 'start', body: 'Write api.json' })
    await writeJSON('api.json', api, { spaces: 2 })
  } catch (e) {
    logger({ type: 'fail' })
    throw e
  }

  logger({ type: 'done' })
  return path
}

function addPath (api, path, method, accountId, functionName, region = 'us-east-1') {
  if (method === 'any') { method = 'x-amazon-apigateway-any-method' }

  if (!api.paths) {
    api.paths = {}
  }

  api.paths[path] = api.paths[path] || {}
  if (api.paths[path][method] !== undefined) { throw new DuplicateEndpointError(method, path) }
  api.paths[path][method] = api.paths[path][method] || {}
  api.paths[path][method][integration] = {
    uri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${region}:${accountId}:function:${functionName}:\${stageVariables.functionAlias}/invocations`,
    passthroughBehavior: 'when_no_match',
    httpMethod: 'POST',
    type: 'aws_proxy'
  }
}

function setupCORS (api, path) {
  api.paths[path].options = api.paths[path].options || cors
}
