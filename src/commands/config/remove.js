import inquirer from 'inquirer'
import configRemove from '../../config-remove'
import * as load from '../../util/load'
import merge from 'lodash.merge'

export const command = 'remove <env> <vars...>'
export const desc = 'Remove environment variables for alias on AWS'
export function builder (yargs) {
  return yargs
  .pkgConf('shep', process.cwd())
  .example('shep config remove beta NEW_VARIABLE', 'Removes NEW_VARIABLE from all functions with beta alias')
}

export async function handler (opts) {
  const envs = await load.envs()

  if (envs && envs.length > 0) {
    const questions = [
      {
        name: 'env',
        message: 'Environment',
        type: 'list',
        choices: () => envs
      }
    ]

    inquirer.prompt(questions.filter((q) => !opts[q.name]))
    .then((inputs) => merge({}, inputs, opts))
    .then(configRemove)
  } else {
    if (!opts.env) { console.log('no API found, cannot load available aliases') }

    configRemove(opts)
  }
}
