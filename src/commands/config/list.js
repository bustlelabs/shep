import inquirer from 'inquirer'
import configList from '../../config-list'
import * as load from '../../util/load'
import merge from 'lodash.merge'

export const command = 'list [env] [function]'
export const desc = 'List environment variables on AWS for an alias'
export function builder (yargs) {
  return yargs
  .pkgConf('shep', process.cwd())
  .example('shep config beta foo', 'List environment variables for function "foo" beta alias')
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
      },
      {
        name: 'function',
        message: 'Function',
        type: 'list',
        choices: () => load.funcs()
      }
    ]
  } else {
    if (!opts.env) { console.log('no API found, cannot load available aliases') }
    questions = [
      {
        name: 'function',
        message: 'Function',
        type: 'list',
        choices: () => load.funcs()
      }
    ]
  }

  inquirer.prompt(questions.filter((q) => !opts[q.name]))
  .then((inputs) => merge({}, inputs, opts))
  .then(configList)
}
