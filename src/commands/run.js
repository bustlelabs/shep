import inquirer from 'inquirer'
import run from '../run'
import * as load from '../util/load'
import merge from 'lodash.merge'

export const command = 'run [pattern]'
export const desc = 'Run a function in your local environment'
export function builder (yargs) {
  return yargs
  .pkgConf('shep', process.cwd())
  .describe('event', 'Event to use')
  .describe('t', 'Truncate responses')
  .describe('build', 'Build functions before running. If omitted functions are transpiled by babel on the fly')
  .default('build', false)
  .example('shep run', 'Launch an interactive CLI')
  .example('shep run foo', 'Runs the `foo` function for all events')
  .example('shep run foo --build', 'Builds the `foo` function and then runs it')
  .example('shep run foo --event default', 'Runs the `foo` function for just the `default` event')
  .example('DB_TABLE=custom shep run foo', 'Runs the `foo` function with process.env.DB_TABLE assigned to custom (vars declared this way will overwrite values in your .env file)')
  .example('shep run \'*\'', 'Runs all functions for all events')
  .example('shep run \'foo-*\'', 'Runs all functions matching pattern `foo-*`')
}

export async function handler (opts) {
  const fns = await load.funcs()
  const questions = [
    {
      name: 'pattern',
      message: 'Function',
      type: 'list',
      choices: () => fns
    }
  ]

  const inputs = await inquirer.prompt(questions.filter((q) => !opts[q.name]))
  const { output, numberOfFailed } = await run(merge({ logger: console.log }, inputs, opts))
  console.log(output)

  if (numberOfFailed > 0) {
    process.exit(numberOfFailed)
  }
}
