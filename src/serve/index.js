import http from 'http'
import url from 'url'
import querystring from 'querystring'
import chalk from 'chalk'
import * as load from '../util/load'
import build from '../util/build-functions'
import runFunction from '../run/run-function'
import list from '../list'
import { getEventFromRequest, getMatchingEndpoint } from './helpers'

export default async function serve (opts) {
  // build
  opts.runDist = opts.build

  if (opts.build) {
    build('*', opts.env, {
      watch: true,
      progress: true,
      quiet: false,
    })
  }

  // get available endpoints
  const endpoints = await list(opts)

  // get lambda functions
  const lambdaFunctions = {}
  const funcs = await load.funcs()
  for (let func of funcs) {
    const lambdaConfig = await load.lambdaConfig(func)
    lambdaFunctions[lambdaConfig.FunctionName] = {
      name: func,
      lambdaConfig: lambdaConfig
    }
  }

  // http listener
  function listener (request, response) {
    request.originalUrl = request.url
    request.url = url.parse(request.url, true)

    // Allow CORS
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
    response.setHeader('Access-Control-Allow-Credentials', true)

    console.log(`\n${chalk.green('URL     :')} ${request.originalUrl}`)

    const endpoint = getMatchingEndpoint(request, endpoints)
    if (!endpoint) {
      if (!opts.quiet) {
        console.log(`${chalk.red('Matching endpoint not found')}`)
      }
      response.writeHead(404)
      return response.end('Endpoint not found')
    }

    const handler = lambdaFunctions[endpoint.handler].name

    onData(request, () => {
      const events = [getEventFromRequest(request, { endpoint, env: opts.env })]
      runFunction(opts)(handler, events)
        .then(result => {
          const funcResponse = result[0].response

          if (opts.verbose) {
            console.log(`${chalk.green('Resource:')} ${endpoint.path}`)
            console.log(`${chalk.green('Function:')} ${result[0].funcName}`)
            console.log(`${chalk.green('Duration:')} ${result[0].end - result[0].start} ms`)
            console.log(`${chalk.green('Response:')}`, funcResponse)
          }

          // validate response
          if (!validateFunctionResponse(funcResponse)) {
            response.writeHead(502)
            return response.end('Bad Gateway')
          }

          // write Headers
          for (const header in funcResponse.headers) {
            if (funcResponse.headers.hasOwnProperty(header)) {
              response.setHeader(header, funcResponse.headers[header])
            }
          }

          // write status code
          response.writeHead(funcResponse.statusCode || 200)

          // write response
          response.end(funcResponse.body || '')
        })
        .catch(error => {
          if (opts.verbose) {
            console.log(`${chalk.green('Resource:')} ${endpoint.path}`)
            console.log(`${chalk.green('Function:')} ${handler}`)
          }
          console.log(error)
          response.writeHead(500)
          response.end('InternalServerError')
        })
    })
  }

  const server = http.createServer(listener)
  server.listen(opts.port)
        .on('listening', () => {
          console.log(`Listening on ${opts.port}`)
        })
        .on('error', onError)

  // if function execution Times out
  // process.on('uncaughtException', () => {})
}

function validateFunctionResponse (funcResponse) {
  // statusCode: httpStatusCode
  if (funcResponse.statusCode && typeof funcResponse.statusCode !== 'number') {
    console.log(`${chalk.red('Function Response Error:')} statusCode must be a valid http status code`)
    return false
  }

  // headers: {} or null
  if (funcResponse.headers && typeof funcResponse.headers !== 'object') {
    console.log(`${chalk.red('Function Response Error:')} headers must be a valid object`)
    return false
  }

  // body: string
  if (funcResponse.body && typeof funcResponse.body !== 'string') {
    console.log(`${chalk.red('Function Response Error:')} body must be a string`)
    return false
  }

  return true
}

function getContentType (request) {
  return (request.headers['content-type'] || 'application/octet-stream').split(';')[0].toLowerCase()
}

function onData (request, onComplete) {
  let body = ''
  request.on('data', (data) => {
    body += data
    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6) {
      request.connection.destroy()
    }
  }).on('end', () => {
    // try parsing body
    try {
      switch (getContentType(request)) {
        case 'application/json':
          request.body = JSON.parse(body || '')
          break
        case 'application/x-www-form-urlencoded':
          request.body = querystring.parse(body || '')
          break
        default:
          request.body = null
      }
    } catch (e) {
      request.body = null
    }

    onComplete()
  })
}

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${error.port} requires elevated privileges`)
      process.exit(1)
    case 'EADDRINUSE':
      console.error(`Port ${error.port} is already in use`)
      process.exit(1)
    default:
      throw error
  }
}
