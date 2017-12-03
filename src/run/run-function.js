import path from 'path'
import Promise from 'bluebird'
import requireProject from '../util/require-project'
import ctx from '../util/context'
import * as load from '../util/load'
import results from './results'
import build from '../util/build-functions'

export default function runFunction (opts) {
  require('dotenv').config()
  return async (name, events) => {
    if (!Array.isArray(events)) {
      const eventNames = await load.events(name, opts.event)
      events = getFunctionEvents(name, eventNames)
    }

    const env = opts.environment || 'development'
    const performBuild = opts.build
    const lambdaConfig = await load.lambdaConfig(name)
    const [ fileName, handler ] = lambdaConfig.Handler.split('.')

    performBuild ? await build(name, env) : require('babel-register')

    const funcName = path.join(name, `${fileName}.js`)
    const funcPath = performBuild ? (await load.distPath(funcName)) : path.join('functions', funcName)

    const func = requireProject(funcPath)[handler]

    if (typeof func !== 'function') {
      throw new Error(`Handler function provided is not a function. Please verify that there exists a handler function exported as "${handler}" in "${funcPath}"`)
    }

    return Promise.map(events, (event) => {
      return new Promise((resolve) => {
        const { context, callbackWrapper } = ctx(lambdaConfig)
        const output = { name: event.name, funcName: name }
        output.start = new Date()
        try {
          func(event.data, context, callbackWrapper((err, res) => {
            output.end = new Date()
            if (err) {
              output.result = results.error
              output.response = err
            } else {
              output.result = results.success
              output.response = res
            }
            resolve(output)
          }))
        } catch (e) {
          output.error = true
          output.end = new Date()
          output.result = results.exception
          output.response = e
          resolve(output)
        }
      })
    })
  }
}

function getFunctionEvents (functionName, eventNames) {
  // read event objects
  return eventNames.map(eventFilename => {
    if (typeof eventFilename !== 'string') { throw new Error('"eventFilename" must be a string') }

    return {
      name: eventFilename,
      data: requireProject(path.join(`functions`, functionName, 'events', eventFilename))
    }
  })
}
