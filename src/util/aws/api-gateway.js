import AWS from './'

export function exportStage (restApiId, stageName) {
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

export function deploy (id, env) {
  const apiGateway = new AWS.APIGateway()
  return apiGateway.createDeployment({restApiId: id, stageName: env, variables: { functionAlias: env }}).promise()
}

export function pushApi (api, id) {
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

export function aliases (id) {
  const apiGateway = new AWS.APIGateway()

  let params = {
    restApiId: id
  }

  return apiGateway.getStages(params).promise()
}
