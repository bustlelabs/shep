import * as load from '../util/load'
import Promise from 'bluebird'
import chalk from 'chalk'
import cliui from 'cliui'
import runFunction from './run-function'
import results from './results'

const ui = cliui({ width: 80 })

const awsNodeVersion = ['4.3.2', '6.10.2']

export default async function (opts) {
  const logger = opts.logger || (() => {})
  const processVersion = process.versions.node

  if (awsNodeVersion.indexOf(processVersion) === -1) {
    logger(`Warning: Lambda currently runs node v${awsNodeVersion} but you are using v${processVersion}`)
  }

  const loggingFunction = logFunction(opts.t)
  const funcRunner = runFunction(opts)
  const names = await load.funcs(opts.pattern)

  const out = await Promise.map(names, funcRunner)
  out.map(loggingFunction)
  const output = ui.toString()

  const numberOfFailed = out.reduce((count, eventResponse) => {
    return count + eventResponse.filter((e) => e.error).length
  }, 0)

  return { output, numberOfFailed }
}

function logFunction (shouldTruncate) {
  return (functionOutput) => {
    ui.div(
      {
        text: functionOutput[0].funcName,
        padding: [1, 0, 0, 0]
      }
    )
    functionOutput.map((eventOut) => formatOutput(eventOut, shouldTruncate))
  }
}

function formatOutput (output, truncate) {
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
      text: (truncate ? formatResponse(output).slice(0, 30) : splitAt(formatResponse(output), ',', 30))
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
