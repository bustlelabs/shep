import AWS from 'aws-sdk'
import Promise from 'bluebird'
AWS.config.setPromisesDependency(Promise)

function promisify(method){
  return function(params){
    const lambda = new AWS.Lambda()
    return lambda[method](params).promise()
  }
}

export const getFunction = promisify('getFunction')
export const createFunction = promisify('createFunction')
export const updateFunctionCode = promisify('updateFunctionCode')
export const updateFunctionConfiguration = promisify('updateFunctionConfiguration')
export const addPermission = promisify('addPermission')
export const getAlias = promisify('getAlias')
export const createAlias = promisify('createAlias')
export const updateAlias = promisify('updateAlias')

export function setAlias(func, name){
  let params = {
    FunctionName: func.FunctionName,
    Name: name
  }

  return getAlias(params)
  .then(()=>{
    params.FunctionVersion = func.Version
    return updateAlias(params)
  })
  .catch({ code: 'ResourceNotFoundException' }, ()=>{
    params.FunctionVersion = func.Version
    return createAlias(params)
  })
}


export function setPermission({ name, region, env, apiId, accountId }){

  let params = {
    Action: 'lambda:InvokeFunction',
    Qualifier: env,
    FunctionName: name,
    Principal: 'apigateway.amazonaws.com',
    StatementId: `api-gateway-${apiId}`,
    SourceArn: `arn:aws:execute-api:${region}:${accountId}:${apiId}/*`
  }

  return addPermission(params)
  .catch((err) => {
    // Swallow errors if permission already exists
    if (err.code !== 'ResourceConflictException'){ throw err }
  })
}
