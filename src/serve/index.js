import path from 'path'
import Promise from 'bluebird'
import http from 'http'
import url from 'url'
import querystring from 'querystring'
import chalk from 'chalk'
import reporter from '../util/reporter'
import * as load from '../util/load'
import requireProject from '../util/require-project'
import ctx from '../util/context'
import build from '../util/build-functions'
import runFunction from '../run/run-function'
import list from '../list'

export default async function serve(opts) {
  const logger = opts.quiet ? () => {} : reporter()
  // get available endpoints
  const endpoints = await list(opts)

  // get lambda functions
  const lambdaFunctions = {};
  const funcs = await load.funcs();
  for (let func of funcs) {
    const lambdaConfig = await load.lambdaConfig(func)
    lambdaFunctions[lambdaConfig.FunctionName] = {
      name: func,
      lambdaConfig: lambdaConfig
    }
  }

  // create http server
  const server = http.createServer((request, response) => {
    request.originalUrl = request.url
    request.url = url.parse(request.url, true)

    console.log(`\n${chalk.green('URL     :')} ${request.originalUrl}`);

    const route = getMatchingEndpoint(request, endpoints)

    if (!route) {
      if (!opts.quiet) {
        console.log(`${chalk.red('Matching route found')}`)
      }
      return response.end('Route not found')
    }

    const handler = lambdaFunctions[route.handler].name

    onData(request, () => {
      const events = [].push(getEventFromRequest(request))
      runFunction(opts)(handler, events)
        .then(result => {
          if (opts.verbose) {
            console.log(`${chalk.green('Route   :')} something`)
            console.log(`${chalk.green('Function:')} ${result[0].funcName}`)
            console.log(`${chalk.green('Duration:')} ${result[0].end - result[0].start} ms`);
            console.log(`${chalk.green('Response:')}`, result[0].response);
          }
          response.end('success')
        })
        .catch(error => {
          if (opts.verbose) {
            console.log(`${chalk.green('Route   :')} something`)
            console.log(`${chalk.green('Function:')} ${handler}`)
          }
          console.log(error);
          response.end('error')
        })
    })
  })

  server.listen(opts.port)
        .on('listening', () => {
          console.log(`Listening on ${opts.port}`)
        })
        .on('error', onError)
}


function getMatchingEndpoint(request, endpoints) {
  return endpoints
          .filter(endpoint => {
            // TODO: need to handle route param matching
            return (endpoint.method.toUpperCase() === 'ANY' || endpoint.method.toUpperCase() === request.method)
                   && endpoint.path === request.url.path
          })
          .shift()
}

function getEventFromRequest(request) {
  return {
    resource: "",
    path: "",
    httpMethod: request.method,
    headers: request.headers,
    queryStringParameters: request.url.query,
    pathParameters: {},
    stageVariables: {},
    body: request.body
  }
}

function getContentType(request) {
  return (request.headers['content-type'] || 'application/octet-stream').split(';')[0].toLowerCase();
}

function onData(request, onComplete) {
  let body = '';
  request.on('data', (data) => {
    body += data;
    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6)
      request.connection.destroy();
  }).on('end', () => {
    // try parsing body
    try {
      switch (getContentType(request)) {
        case 'application/json':
          request.body = JSON.parse(body)
          break
        case 'application/x-www-form-urlencoded':
          request.body = querystring.parse(body)
          break
        default:
          request.body = null
      }
    } catch (e) {
      request.body = null
    }

    onComplete();
  });
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${error.port} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`Port ${error.port} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}
