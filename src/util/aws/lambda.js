import AWS from './'
import loadRegion from './region-loader'
import merge from 'lodash.merge'
import isEqual from 'lodash.isequal'
import got from 'got'
import { AWSEnvironmentVariableNotFound } from '../errors'

const debug = require('debug')('shep:lambda')

/*
const Function = {
  FunctionName: 'string',
  // should be ADT but hey this works
  Code: {
    CodeSha256: undefined || 'sha',
    Zip: undefined || 'binary string',
    s3: undefined || {
      bucket: 'string',
      key: 'string'
    }
  },
  Identifier: {
   Alias: undefined || 'string',
   Version: undefined || 'string'
  }
  Config: {}
}
*/

export async function getFunction ({ FunctionName, Qualifier }) {
  debug('getFunction', arguments[0])
  await loadRegion()
  const lambda = new AWS.Lambda()

  const func = await lambda.getFunction({ FunctionName, Qualifier }).promise()
  const isVersion = /[0-9]+/.test(Qualifier)
  return {
    FunctionName,
    Identifier: {
      Version: func.Configuration.Version,
      Alias: isVersion ? undefined : Qualifier
    },
    Code: { CodeSha256: func.Configuration.CodeSha256 },
    Config: configStripper(func.Configuration)
  }
}

export async function createFunction ({ FunctionName, Alias, Code, Config }) {
  debug('createFunction', arguments[0])
  validateConfig(Config)
  await loadRegion()
  const lambda = new AWS.Lambda()

  const createFunctionParams = { ...Config, Publish: true, Code: {} }
  const createAliasParams = { FunctionName, Name: Alias }

  if (Code.s3) {
    debug('createFunction: using s3 bucket for code')
    createFunctionParams.Code.S3Bucket = Code.s3.bucket
    createFunctionParams.Code.S3Key = Code.s3.key
  } else if (Code.Zip) {
    debug('createFunction: using local zip file for code')
    createFunctionParams.Code.ZipFile = Code.Zip
  } else {
    throw new Error('need to upload code')
  }

  const newFunc = await lambda.createFunction(createFunctionParams).promise()

  createAliasParams.FunctionVersion = newFunc.Version
  await lambda.createAlias(createAliasParams).promise()

  return {
    FunctionName,
    Identifier: {
      Alias,
      Version: newFunc.Version
    },
    Config: configStripper(newFunc),
    Code: { CodeSha256: newFunc.CodeSha256 }
  }
}

export async function updateFunction (oldFunction, wantedFunction) {
  debug('updateFunction', oldFunction, wantedFunction)
  await loadRegion()
  const lambda = new AWS.Lambda()
  const { FunctionName } = oldFunction
  const Alias = wantedFunction.hasOwnProperty('Identifier') ? wantedFunction.Identifier.Alias || oldFunction.Identifier.Alias : oldFunction.Identifier.Alias
  const updateCodeParams = { FunctionName }
  const updateConfigParams = { FunctionName }
  const publishVersionParams = { FunctionName }
  const updateAliasParams = { FunctionName }
  const aliasExists = !!Alias && await doesAliasExist({ FunctionName, Alias })

  if (wantedFunction.Code.Zip) {
    debug('updateFunction: using zip file for code')
    updateCodeParams.ZipFile = wantedFunction.Code.Zip
  } else if (wantedFunction.Code.s3) {
    debug('updateFunction: using s3 bucket for code')
    updateCodeParams.S3Bucket = wantedFunction.Code.s3.bucket
    updateCodeParams.S3Key = wantedFunction.Code.s3.key
  } else {
    const { Code } = await lambda.getFunction({ FunctionName: oldFunction.FunctionName, Qualifier: (aliasExists ? Alias : undefined) }).promise()
    debug('updateFunction: downloading', Code.Location)
    updateCodeParams.ZipFile = (await got(Code.Location, { encoding: null })).body
  }

  debug('updateFunction: updateFunctionCode()', updateCodeParams)
  const uploadedFunc = await lambda.updateFunctionCode(updateCodeParams).promise()
  publishVersionParams.CodeSha256 = uploadedFunc.CodeSha256

  merge(updateConfigParams, configStripper(wantedFunction.Config))
  debug('updateFunction: updateConfig.Environment()', updateConfigParams.Environment.Variables)
  const configState = await lambda.updateFunctionConfiguration((updateConfigParams)).promise()

  if (configState.CodeSha256 !== publishVersionParams.CodeSha256) { throw new AWSUnexpectedLambdaState('Different CodeSha256') }
  debug('publishVersion:', publishVersionParams)
  const updatedFunc = await lambda.publishVersion(publishVersionParams).promise()
  if (!isConfigEqual(configState, updatedFunc)) {
    throw new AWSUnexpectedLambdaState('Failing to update alias as function configs are not as expected')
  }

  updateAliasParams.FunctionVersion = updatedFunc.Version
  updateAliasParams.Name = Alias

  if (aliasExists) {
    await lambda.updateAlias(updateAliasParams).promise()
  } else {
    await lambda.createAlias(updateAliasParams).promise()
  }
  debug('updateAlias:', updateAliasParams)

  debug('updateFunction success!', updateAliasParams)
  return {
    FunctionName: updatedFunc.FunctionName,
    Identifier: {
      Alias,
      Version: updatedFunc.Version
    },
    Code: { CodeSha256: updatedFunc.CodeSha256 },
    Config: configStripper(updatedFunc)
  }
}

function isConfigEqual (a, b) {
  const c = merge({}, a)
  delete c['Version']
  delete c['LastModified']
  delete c['FunctionArn']
  delete c['VpcConfig']
  const d = merge({}, b)
  delete d['Version']
  delete d['LastModified']
  delete d['FunctionArn']
  delete d['VpcConfig']
  debug('c', c)
  debug('d', d)

  return isEqual(c, d)
}

// should beef this up
// for VpcConfig can only pass SecurityGroupIds and SubnetIds
function configStripper (c) {
  return {
    DeadLetterConfig: c.DeadLetterConfig,
    Description: c.Description,
    Environment: c.Environment,
    Handler: c.Handler,
    MemorySize: c.MemorySize,
    Role: c.Role,
    Runtime: c.Runtime,
    Timeout: c.Timeout,
    TracingConfig: c.TracingConfig
  }
}

export async function isFunctionDeployed (FunctionName, Qualifier) {
  await loadRegion()

  try {
    await getFunction({ FunctionName, Qualifier })
  } catch (err) {
    if (err.code === 'ResourceNotFoundException') { return false }
    throw err
  }
  return true
}

export async function doesAliasExist ({ FunctionName, Alias }) {
  await loadRegion()
  const lambda = new AWS.Lambda()

  try {
    await lambda.getAlias({ FunctionName, Name: Alias }).promise()
  } catch (err) {
    if (err.code === 'ResourceNotFoundException') { return false }
    throw err
  }
  return true
}

export async function getEnvironment (env, { FunctionName }) {
  await loadRegion()
  const params = {
    FunctionName,
    Qualifier: env
  }

  try {
    const envVars = await getFunction(params)
    .get('Config')
    .get('Environment')
    .get('Variables')
    return envVars
  } catch (e) {
    if (e.code === 'ResourceNotFoundException') {
      throw new AWSEnvironmentVariableNotFound(FunctionName)
    }
    throw e
  }
}

export async function getAliasVersion ({ functionName, aliasName }) {
  await loadRegion()
  const lambda = new AWS.Lambda()

  const params = {
    FunctionName: functionName,
    Name: aliasName
  }

  return lambda.getAlias(params).promise()
    .get('FunctionVersion')
}

export async function setPermission ({ name, region, env, apiId, accountId }) {
  await loadRegion()
  const lambda = new AWS.Lambda()

  let params = {
    Action: 'lambda:InvokeFunction',
    Qualifier: env,
    FunctionName: name,
    Principal: 'apigateway.amazonaws.com',
    StatementId: `api-gateway-${apiId}`,
    SourceArn: `arn:aws:execute-api:${region}:${accountId}:${apiId}/*`
  }

  try {
    const func = await lambda.addPermission(params).promise()
    return func
  } catch (e) {
    // Swallow errors if permission already exists
    if (e.code !== 'ResourceConflictException' && e.code !== 'ResourceNotFoundException') { throw e }
  }
}

export async function listAliases (functionName) {
  await loadRegion()
  const lambda = new AWS.Lambda()

  const params = {
    FunctionName: functionName
  }

  return lambda.listAliases(params).promise().get('Aliases')
}

function validateConfig (config) {
  if (!config.Role) {
    throw new AWSInvalidLambdaConfiguration()
  }
}

export class AWSInvalidLambdaConfiguration extends Error {
  constructor () {
    const msg = 'You need to specify a valid Role for your lambda functions. See the shep README for details.'
    super(msg)
    this.message = msg
    this.name = 'AWSInvalidLambdaConfiguration'
  }
}

export class AWSUnexpectedLambdaState extends Error {
  constructor (additional) {
    const msg = `While updating the lambda function, the state changed before the update could be completed. ${additional}`
    super(msg)
    this.message = msg
    this.name = 'AWSUnexpectedLambdaState'
  }
}
