import requireProject from '../util/require-project'
import * as load from '../util/load'
import build from '../util/build-functions'
import Promise from 'bluebird'
import chalk from 'chalk'
import AWS from 'aws-sdk'

import cliui from 'cliui'
const ui = cliui({ width: 80 })

const results = { success: 'SUCCESS', error: 'ERROR', exception: 'EXCEPTION' }

const awsNodeVersion = '4.3.2'

export default async function (opts) {
  AWS.config.update({region: opts.region})

  const processVersion = process.versions.node

  if (processVersion !== awsNodeVersion) {
    console.log(`Warning: Lambda currently runs node v${awsNodeVersion} but you are using v${processVersion}`)
  }

  const verbose = opts.v
  const performBuild = opts.build
  const name = opts.name
  const env = opts.environment || 'development'
  const lambdaConfig = load.lambdaConfig(name)
  const events = load.events(name, opts.event)
  const [ fileName, handler ] = lambdaConfig.Handler.split('.')

  const context = {}

  if (performBuild) {
    await build(name, env)
  }

  const func = requireProject(`dist/${name}/${fileName}`)[handler]

  const out = await Promise.map(events, (eventFilename) => {
    const event = requireProject(`functions/${name}/events/${eventFilename}`)
    return new Promise((resolve) => {
      const output = { name: eventFilename }
      output.start = new Date()
      try {
        func(event, context, (err, res) => {
          output.end = new Date()
          if (err) {
            output.result = results.error
            output.response = err
          } else {
            output.result = results.success
            output.response = res
          }
          resolve(output)
        })
      } catch (e) {
        output.end = new Date()
        output.result = results.exception
        output.response = e
        resolve(output)
      }
    })
  })

  logOutput(out)
  out.map((out) => formatOutput(out, verbose))
  console.log(ui.toString())
}

function logOutput (outputs) {
  if (outputs.length === 1) {
    console.log(outputs[0].response)
  }
}

function formatOutput (output, verbose) {
  ui.div(
    {
      text: output.name,
      width: 20
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
      text: (verbose ? splitAt(formatResponse(output), ',', 30) : formatResponse(output).slice(0, 30))
    }
    )
}

function formatResponse ({ result, response }) {
  if (response) {
    if (result === results.success) {
      return JSON.stringify(response)
    } else if (result === results.error) {
      return JSON.stringify(response)
    } else if (result === results.exception) {
      return `${response.name} ${response.message}`
    }
  } else {
    return ''
  }
}

function formatDate ({ start, end }) {
  return `${end - start}ms`
}

function formatResult ({ result }) {
  if (result === results.success) {
    return chalk.green(results.success)
  } else if (result === results.error) {
    return chalk.yellow(results.error)
  } else if (result === results.exception) {
    return chalk.red(results.exception)
  }
}

function splitAt (str, token, width) {
  return str.split(token)
  .reduce((sum, curr) => {
    let lastLine = sum.slice(-1)[0]

    if (!lastLine || curr.length > width || lastLine.length + curr.length >= width) {
      sum.push(curr)
    } else {
      sum[sum.length - 1] = [lastLine, curr].join(token)
    }

    return sum
  }, [])
}
