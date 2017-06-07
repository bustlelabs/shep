import inquirer from 'inquirer'
import configDump from '../../config-dump'
import * as load from '../../util/load'
import merge from 'lodash.merge'

export const command = 'dump [env]'
export const desc = 'Prints all common environmental variables and differences'
export function builder (yargs) {
  return yargs
  .pkgConf('shep', process.cwd())
  .boolean('json')
  .describe('json', 'Formats output as JSON')
  .example('shep config dump beta', 'Print to console all environment variables of environment `beta` in JSON format')
}

export async function handler (opts) {
  const envs = await load.envs()
  let questions

  if (envs && envs.length > 0) {
    questions = [
      {
        name: 'env',
        message: 'Environment',
        type: 'list',
        choices: () => envs
      }
    ]
  } else {
    if (!opts.env) { throw new Error('No API found, cannot load available aliases') }
  }

  inquirer.prompt(questions.filter((q) => !opts[q.name]))
  .then((inputs) => merge({}, inputs, opts))
  .then(configDump)
}
