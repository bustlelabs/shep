import lint from '../lint'

export const command = 'lint'
export const desc = 'Checks your projects against best standards'
export function builder (yargs) {
  return yargs
  .describe('quiet', 'Don\'t log anything')
  .describe('verbose', 'Logs additional information')
  .default('quiet', false)
  .alias('q', 'quiet')
  .example('shep lint', 'Runs the linter on your project')
}

export const handler = lint
