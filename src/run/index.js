import requireProject from '../util/require-project'
import loadLambdaConfig from '../util/load-lambda-config'
import loadEvents from '../util/load-events'
import build from '../build'
import Promise from 'bluebird'
import chalk from 'chalk'
import AWS from 'aws-sdk'

import cliui from 'cliui'
const ui = cliui({ width: 80 })

const results = { success: 'SUCCESS' , error: 'ERROR', exception: 'EXCEPTION' }

const awsNodeVersion = '4.3.2'
const processVersion = process.versions.node

export default function(opts){
  AWS.config.update({region: opts.region})

  if (processVersion !== awsNodeVersion ){
    console.log(`Warning: Lambda currently runs node v${awsNodeVersion} but you are using v${processVersion}`)
  }

  const performBuild = opts.build
  const name = opts.name
  const env = opts.environemnt || 'development'
  const lambdaConfig = loadLambdaConfig(name)
  const events = loadEvents(name, opts.event)
  const [ fileName, handler ] = lambdaConfig.Handler.split('.')

  const context = {}

  return Promise.resolve()
  .then(() => { if (performBuild === true) return build({ functions: name, env: env }) })
  .then(() => requireProject(`dist/${name}/${fileName}`)[handler] )
  .then((func) => {
    return Promise.map(events, (eventFilename) => {
      const event = requireProject(`functions/${name}/events/${eventFilename}`)
      return new Promise((resolve) => {
        let output = { name: eventFilename }
        output.start = new Date()
        try {
          func(event, context, (err, res)=>{
            output.end = new Date()
            if (err){
              output.result = results.error
              output.response = err
            } else {
              output.result = results.success
              output.response = res
            }
            resolve(output)
          })
        } catch (e){
          output.end = new Date()
          output.result = results.exception
          output.response = e
          resolve(output)
        }
      })
    })
  })
  .tap(logOutput)
  .map(formatOutput)
  .then(() => console.log(ui.toString()))
}

function logOutput(outputs){
  if(outputs.length === 1){
    console.log(outputs[0].response)
  }
}

function formatOutput(output){
    ui.div(
      {
        text: output.name,
        width: 20,
      },
      {
        text: formatResult(output),
        width: 15
      },
      {
        text: formatDate(output),
        width: 10
      },
      {
        text: formatResponse(output)
      }
    )
}

function formatResponse({ result, response }){
  if (response){
    if (result === results.success ){
      return JSON.stringify(response).trim(30)
    } else if (result === results.error) {
      return JSON.stringify(response).trim(30)
    } else if (result === results.exception){
      return `${response.name} ${response.message}`.trim(30)
    }
  } else {
    return ""
  }
}

function formatDate({ start, end }){
  return `${end-start}ms`
}

function formatResult({ result }){
  if (result === results.success ){
    return chalk.green(results.success)
  } else if (result === results.error) {
    return chalk.yellow(results.error)
  } else if (result === results.exception){
    return chalk.red(results.exception)
  }
}
