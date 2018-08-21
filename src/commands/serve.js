import serve from '../serve'

export const command = 'serve'
export const desc = 'Start local server'
export function builder (yargs) {
  return yargs
  .describe('quiet', 'Don\'t log anything')
  .default('quiet', false)
  .alias('q', 'quiet')
  .describe('build', 'Build functions before running. If omitted functions are transpiled by babel on the fly')
  .default('build', false)
  .describe('verbose', 'Show detailed logs')
  .default('verbose', false)
  .describe('env', 'Environment value')
  .default('env', 'development')
  .describe('port', 'Start local server on the given port')
  .default('port', 3000)
  .example('shep serve', 'Starts local server default port 3000')
  .example('shep serve --port 4000', 'Starts local server on port 4000')
}

export async function handler (opts) {
  await serve(opts)
}
