import AWS from './'
import loadRegion from './region-loader'

export async function getLogGroup ({ FunctionName }) {
  await loadRegion()
  const cwLogs = new AWS.CloudWatchLogs()
  const expetedName = `/aws/lambda/${FunctionName}`

  const params = {
    logGroupNamePrefix: expetedName
  }

  try {
    const groups = await cwLogs.describeLogGroups(params).promise().get('logGroups')
    const matchedGroups = groups.filter((logGroup) => logGroup.logGroupName === expetedName)
    return matchedGroups.pop().logGroupName
  } catch (e) {
    throw new Error('No log groups found for specified function')
  }
}

export async function getLogStreams ({ logGroupName, functionVersion }) {
  await loadRegion()
  const cwLogs = new AWS.CloudWatchLogs()
  const versionRegExp = new RegExp(`\\[${functionVersion}\\]`)

  // LastEventTime isn't always accurate
  const params = {
    logGroupName,
    orderBy: 'LastEventTime',
    descending: true
  }

  const logStreams = await cwLogs.describeLogStreams(params).promise().get('logStreams')
  return logStreams.map(({ logStreamName }) => logStreamName).filter(versionRegExp.test.bind(versionRegExp))
}

export async function getLogEvents ({ logGroupName, logStreamNames, start, end }) {
  await loadRegion()
  const cwLogs = new AWS.CloudWatchLogs()

  const params = {
    logGroupName,
    logStreamNames,
    startTime: start,
    endTime: end,
    interleaved: true
  }

  return cwLogs.filterLogEvents(params).promise()
  .get('events')
}
