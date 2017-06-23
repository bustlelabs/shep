import Promise from 'bluebird'
import { getLogGroup } from '../util/aws/cloudwatch-logs'
import { getAliasVersion } from '../util/aws/lambda'
import getLogs from '../util/get-logs'
import { lambdaConfig } from '../util/load'

export default async function ({ name, env, time = Infinity, logger = () => {} }) {
  const { FunctionName } = await lambdaConfig(name)
  const aliasName = env

  const [logGroupName, functionVersion] = await Promise.all([getLogGroup({ FunctionName }), getAliasVersion({ functionName: FunctionName, aliasName })])
  const logs = await getLogs({ logGroupName, functionVersion, timeLeft: time, logger })
  return printEventsLoop(logs)
}

async function printEventsLoop ({ events, logger, nextLogCall }) {
  const rate = 1000

  if (events !== undefined && events.length !== 0) {
    logger(events.map(formatEvent).join(''))
  }

  if (nextLogCall === undefined) {
    return Promise.resolve()
  }

  await Promise.delay(rate)
  const logs = await nextLogCall(rate)
  return printEventsLoop(logs)
}

function formatEvent ({ timestamp, message }) {
  return `[${new Date(timestamp).toTimeString()}]: ${message}`
}
