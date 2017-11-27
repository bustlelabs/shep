import path from 'path'
import Promise from 'bluebird'
import http from 'http'
import reporter from '../util/reporter'
import * as load from '../util/load'
import requireProject from '../util/require-project'
import ctx from '../util/context'
import build from '../util/build-functions'
import runFunction from '../run/run-function'
import list from '../list'

export default async function serve(opts) {
  const endpoints = await list(opts)

  const lambdaFunctions = {};
  const funcs = await load.funcs();
  for (let func of funcs) {
    const lambdaConfig = await load.lambdaConfig(func)
    lambdaFunctions[lambdaConfig.FunctionName] = {
      name: func,
      lambdaConfig: lambdaConfig
    }
  }

  const server = http.createServer((request, response) => {
    const route = getMatchingEndpoint(request, endpoints)

    if (!route) {
      console.log('No matching route found')
      return response.end('Route not found')
    }

    const handler = lambdaFunctions[route.handler].name
    const events = [].push(getEventFromRequest(request))

    runFunction({})(handler, events)
      .then(result => {
        response.end('success')
      })
      .catch(error => {
        response.end('error')
      })
  })

  server.listen(4000)
}

function getMatchingEndpoint(request, endpoints) {
  console.log(endpoints, request.method);
  return endpoints
          .filter(endpoint => {
            // need to handle route param matching
            return endpoint.method.toUpperCase() === request.method && endpoint.path === request.url
          })
          .shift()
}

function getEventFromRequest(request) {
  return {
    resource: "",
    path: "",
    httpMethod: "GET",
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    stageVariables: {},
    body: null
  }
}
