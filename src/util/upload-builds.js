import Promise from 'bluebird'
import hashBuild from './hash-build'
import { funcs, distPath } from './load'
import zipDir from './zip-dir'
import { putBuild, buildExists, bucketExists, putBucket } from './aws/s3'

// remind me to fix this or make it more clean or something
export default async function (pattern, bucket) {
  const fns = await funcs(pattern)
  return Promise.map(fns, async (func) => {
    const path = await distPath(func)
    const zip = await zipDir(path)
    const hash = hashBuild(zip)
    const key = `${func}-${hash}.zip`

    if (!await bucketExists(key, bucket)) {
      await putBucket(key, bucket, zip)
    }

    if (!await buildExists(key, bucket)) {
      await putBuild(key, bucket, zip)
    }

    return { name: func, key, bucket }
  })
}
