import Promise from 'bluebird'
import hashBuild from './hash-build'
import { putBuild } from './aws/s3'
import { funcs, distPath } from './load'

export default async function (pattern, bucket) {
  const fns = await funcs(pattern)
  return Promise.map(fns, async (func) => {
    const path = await distPath(func)
    const hash = await hashBuild(path)
    return putBuild(hash, path, bucket, func)
  })
}
