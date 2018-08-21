import exec from './modules/exec'
import { pkg } from './load'

export default async function (PATTERN, NODE_ENV, opts) {
  const { shep } = await pkg()
  let buildCommand = (shep && shep.buildCommand) || 'webpack --bail'
  if (opts) {
    buildCommand += opts.watch ? ' --watch' : ''
    buildCommand += opts.progress ? ' --progress' : ''
  }

  const cmd = exec(buildCommand, { env: { ...process.env, PATTERN, NODE_ENV } })

  if (!opts || !opts.quiet) {
    cmd.stdout.pipe(process.stdout)
    cmd.stderr.pipe(process.stderr)
  }

  return cmd
        .catch({ code: 'ENOENT' }, (e) => {
          console.warn('No locally installed webpack found. Verify that webpack is installed')
          throw e
        })
}
