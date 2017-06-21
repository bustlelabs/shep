import generateFunction from '../generate-function'
import { writeJSON } from '../util/modules/fs'
import { cors } from './templates'
import genName from '../util/generate-name'
import * as load from '../util/load'

const integration = 'x-amazon-apigateway-integration'

export default async function ({ accountId, path, method, logger = () => {} }) {
  if (!accountId) {
    throw new Error('Unable to determine your AWS Account ID. Please set it in the `shep` section of package.json')
  }

  const api = await load.api() || {}

  const name = `${path} ${method}`
  const { shortName, fullName } = await genName(name)

  logger({ type: 'start', body: `Generate Function ${shortName}` })
  await generateFunction({ name, quiet: true })

  logger({ type: 'start', body: 'Setup Endpoint' })
  addPath(api, path, method, accountId, fullName)

  logger({ type: 'start', body: 'Setup CORS' })
  setupCORS(api, path)

  logger({ type: 'start', body: 'Write api.json' })
  await writeJSON('api.json', api, { spaces: 2 })

  logger({ type: 'done' })
  return path
}

function addPath (api, path, method, accountId, functionName) {
  if (method === 'any') { method = 'x-amazon-apigateway-any-method' }

  if (!api.paths) {
    api.paths = {}
  }

  api.paths[path] = api.paths[path] || {}
  if (api.paths[path][method] !== undefined) { throw new Error(`Method '${method}' on path '${path}' already exists`) }
  api.paths[path][method] = api.paths[path][method] || {}
  api.paths[path][method][integration] = {
    uri: `arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:${accountId}:function:${functionName}:\${stageVariables.functionAlias}/invocations`,
    passthroughBehavior: 'when_no_match',
    httpMethod: 'POST',
    type: 'aws_proxy'
  }
}

function setupCORS (api, path) {
  api.paths[path].options = api.paths[path].options || cors
}
