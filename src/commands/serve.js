import serve from '../serve'

export const command = 'serve'
export const desc = 'Start local server'
export function builder (yargs) {
  return yargs
  .describe('quiet', 'Don\'t log anything')
  .default('quiet', false)
  .alias('q', 'quiet')
  .example('shep serve', 'Starts local server')
}

export async function handler (opts) {
  await serve(opts)
}
