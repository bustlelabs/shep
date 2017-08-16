import exec from './modules/exec'
import { pkg } from './load'

export default async function (PATTERN, NODE_ENV) {
  const { shep } = await pkg()
  const buildCommand = (shep && shep.buildCommand) || 'webpack --bail'
  return exec(buildCommand, { env: { ...process.env, PATTERN, NODE_ENV } })
    .catch({ code: 'ENOENT' }, (e) => {
      console.warn('No locally installed webpack found. Verify that webpack is installed')
      throw e
    })
}
