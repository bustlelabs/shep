import { getLogStreams, getLogEvents } from './aws/cloudwatch-logs'

async function getLogs ({ logGroupName, functionVersion, timeLeft, logger, start = Date.now() }) {
  const logStreamNames = await getLogStreams({ logGroupName, functionVersion })
  const recievedEvents = logStreamNames.length === 0 ? [] : await getLogEvents({ logGroupName, logStreamNames, start })

  const timestamp = recievedEvents.reduce(maxTimestamp, start)
  // If timestamp from new event, increase start time to avoid duplicate events
  const lastTimestamp = timestamp === start ? timestamp : timestamp + 1

  return {
    events: recievedEvents,
    logger,
    nextLogCall: tailCallGenerator({ logGroupName, functionVersion, timeLeft, lastTimestamp, logger })
  }
}

function tailCallGenerator ({ logGroupName, functionVersion, timeLeft, lastTimestamp, logger }) {
  if (timeLeft >= 0) {
    return (delay) => getLogs({ logGroupName, functionVersion, timeLeft: timeLeft - delay, start: lastTimestamp, logger })
  }
  return () => Promise.resolve({})
}

function maxTimestamp (latest, event) {
  return Math.max(latest, event.timestamp)
}

export default getLogs
