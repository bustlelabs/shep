import * as load from '../util/load'
import parseApi from '../util/parse-api'

export default async function list(opts) {
  const api = await load.api() || {}
  let endpoints = parseApi(api)
  endpoints = endpoints
              .filter(endpoint => endpoint.method !== 'options')
              .map(endpoint => ({
                path: endpoint.path,
                method: endpoint.method,
                handler: getFunction(endpoint.integration.uri),
                region: getRegion(endpoint.integration.uri)
              }))
  return endpoints
}

function getRegion(uri) {
  // `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${region}:${accountId}:function:${functionName}:\${stageVariables.functionAlias}/invocations`
  const uriParts = uri.split(':')
  return uriParts[3]
}

function getFunction(uri) {
  // `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${region}:${accountId}:function:${functionName}:\${stageVariables.functionAlias}/invocations`
  const uriParts = uri.split(':')
  return uriParts[11]
}
