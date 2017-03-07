import lint from '../doctor'

export const command = 'doctor'
export const desc = 'Checks your projects against best standards'
export function builder (yargs) {
  return yargs
  .describe('quiet', 'Don\'t log anything')
  .describe('verbose', 'Logs additional information')
  .default('quiet', false)
  .alias('q', 'quiet')
  .example('shep doctor', 'Runs the doctor on your project')
}

export const handler = lint
