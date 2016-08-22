import Promise from 'bluebird'
import loadFuncs from '../util/load-funcs'
import build from '../util/build-function'
import upload from '../util/upload-function'
import lambda from '../util/lambda'
import { createDeployment } from '../util/api-gateway'
import pushApi from '../push'
import AWS from 'aws-sdk'
import { queue } from '../util/tasks'

export default function(opts){
  const functions = loadFuncs(opts.functions)
  const concurrency = opts.concurrency || Infinity
  const env = opts.env
  const region = opts.region
  const performBuild = opts.build

  AWS.config.update({region: region})

  return Promise.resolve(functions)
  .tap((funcs) => funcs.map(queue))
  .map(buildAndUploadFunction, { concurrency })
  .then(pushAndDeployApi)


  function buildAndUploadFunction(name) {
    return Promise.resolve()
    .then(() => { if (performBuild === true) return build(name, env) })
    .then(() => upload(name) )
  }

  function pushAndDeployApi(funcs){
    return pushApi(opts)
    .then(({ result }) => {
      return Promise.resolve(funcs)
      .map(setAlias)
      .map((alias) => setPermissions(alias, result) )
      .return(result)
    })
    .then(deployApi)
  }

  function setAlias(func){
    let params = {
      FunctionName: func.FunctionName,
      Name: env
    }

    return lambda.getAlias(params)
    .then(()=>{
      params.FunctionVersion = func.Version
      return lambda.updateAlias(params)
    })
    .catch({ code: 'ResourceNotFoundException'}, ()=>{
      params.FunctionVersion = func.Version
      return lambda.createAlias(params)
    })
  }

  function setPermissions(alias, api){
    const [, accountId, functionName] = alias.AliasArn.match(new RegExp(`^arn:aws:lambda:${region}:([0-9]+):function:([a-zA-Z0-9-_]+):`))

    let params = {
      Action: 'lambda:InvokeFunction',
      Qualifier: alias.Name,
      FunctionName: functionName,
      Principal: 'apigateway.amazonaws.com',
      StatementId: 'api-gateway-access',
      SourceArn: `arn:aws:execute-api:${region}:${accountId}:${api.id}/*/*/*`
    }

    return lambda.addPermission(params)
    .catch((err) => { if (err.code !== 'ResourceConflictException'){ throw err } })
  }

  function deployApi(api){
    return createDeployment({restApiId: api.id, stageName: env, variables: {functionAlias: env}})
  }
}
