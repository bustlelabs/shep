import AWS from './'
import loadRegion from './region-loader'
import Promise from 'bluebird'

export const DEPLOY_ATTEMPT_MAX = 2

export async function exportStage (restApiId, stageName) {
  await loadRegion()
  const apiGateway = new AWS.APIGateway()
  const params = {
    restApiId,
    stageName,
    exportType: 'swagger',
    accepts: 'json',
    parameters: {
      extensions: 'integrations,authorizers'
    }
  }

  return apiGateway.getExport(params).promise()
  .get('body')
}

export async function deploy (id, env, attempts = 1) {
  await loadRegion()
  const apiGateway = new AWS.APIGateway()

  try {
    const deployment = await apiGateway.createDeployment({restApiId: id, stageName: env, variables: { functionAlias: env }}).promise()
    return deployment
  } catch (e) {
    if (e.code !== 'TooManyRequestsException') { throw e }
    if (!e.retryable && attempts > DEPLOY_ATTEMPT_MAX) { throw new AWSLimitError() }
    await Promise.delay(e.retryDelay * 1000)
    return deploy(id, env, attempts++)
  }
}

export async function pushApi (api, id) {
  await loadRegion()
  const apiGateway = new AWS.APIGateway()

  let params = {
    body: JSON.stringify(api),
    failOnWarnings: true
  }

  if (id) {
    params.mode = 'overwrite'
    params.restApiId = id
    return apiGateway.putRestApi(params).promise().get('id')
  } else {
    return apiGateway.importRestApi(params).promise().get('id')
  }
}

export async function aliases (id) {
  await loadRegion()
  const apiGateway = new AWS.APIGateway()

  let params = {
    restApiId: id
  }

  return apiGateway.getStages(params).promise().get('item').map((x) => x.stageName)
}

export class AWSLimitError extends Error {
  constructor () {
    const msg = `Amazon limit and retry limit of ${DEPLOY_ATTEMPT_MAX} hit`
    super(msg)
    this.message = msg
    this.name = 'AWSLimitError'
  }
}
