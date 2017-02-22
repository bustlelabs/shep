import build from '../build'

export const command = 'build [functions]'
export const desc = 'Builds functions and writes them to disk'
export function builder (yargs) {
  return yargs
  .describe('quiet', 'Don\'t log anything')
  .default('quiet', false)
  .alias('q', 'quiet')
  .example('shep build', 'Launch an interactive CLI')
  .example('shep build \'*\'', 'Build all functions')
  .example('shep build create-user', 'Build only the create-user function')
  .example('shep build \'*-user\'', 'Build functions matching the pattern *-user')
}

export const handler = build
