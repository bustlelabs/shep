import reporter from '../util/reporter'
import build from '../build'

export const command = 'build'
export const desc = 'Builds functions and writes them to disk'
export function builder (yargs) {
  return yargs
  .describe('quiet', 'Don\'t log anything')
  .default('quiet', false)
  .alias('q', 'quiet')
  .example('shep build', 'Builds functions')
  .example('shep build --functions create-user', 'Build only the create-user function')
  .example('shep build --functions \'*-user\'', 'Build functions matching the pattern *-user')
}

export async function handler (opts) {
  const logger = opts.quiet ? () => {} : reporter()
  logger({ type: 'start', body: `Build Functions` })
  try {
    await build(opts)
  } catch (e) {
    logger({ type: 'fail' })
    throw e
  }
  logger({ type: 'done' })
}
