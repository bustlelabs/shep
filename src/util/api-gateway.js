import AWS from 'aws-sdk'
import Promise from 'bluebird'
AWS.config.setPromisesDependency(Promise)

export const createDeployment = promisify('createDeployment')
export const getExport = promisify('getExport')
export const importRestApi = promisify('importRestApi')
export const putRestApi = promisify('putRestApi')

function promisify(method){
  return function(params){
    const apiGateway = new AWS.APIGateway()
    return apiGateway[method](params).promise()
  }
}

export function deployApi(id, env){
  const apiGateway = new AWS.APIGateway()
  return apiGateway.createDeployment({restApiId: id, stageName: env, variables: { functionAlias: env }}).promise()
}

export function pushApi(api, id){
  let params = {
    body: JSON.stringify(api),
    failOnWarnings: true
  }

  if (id){
    params.mode = 'overwrite'
    params.restApiId = id
    return putRestApi(params)
  } else {
    return importRestApi(params)
  }
}
