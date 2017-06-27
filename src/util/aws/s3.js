import AWS from './'
import loadRegion from './region-loader'

export async function putBuild (hash, path, bucket, func) {
  await loadRegion()
  const s3 = new AWS.S3()

  const getParams = { Bucket: bucket, Key: hash }
  const putParams = { ...getParams, Body: path }

  try {
    await s3.getObject(getParams).promise()
    return null
  } catch (e) {
    if (e.code !== 'NoSuchKey') { throw e }
    return s3.upload(putParams).promise().then(() => { return func })
  }
}
