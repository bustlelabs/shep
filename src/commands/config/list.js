import inquirer from 'inquirer'
import configList from '../../config-list'
import * as load from '../../util/load'
import merge from 'lodash.merge'
import { values } from '../../util/environment-check'

export const command = 'list'
export const desc = 'List environment variables on AWS for an alias'
export function builder (yargs) {
  return yargs
  .pkgConf('shep', process.cwd())
  .boolean('json')
  .boolean('quiet')
  .alias('quiet', 'q')
  .describe('quiet', 'Don\'t log anything')
  .describe('env', 'Specifies which environment. If not provided an interactive menu will display the options')
  .describe('json', 'Formats output as JSON')
  .example('shep config list --env beta', 'Print to console all environment variables of environment `beta` in JSON format')
}

export async function handler (opts) {
  const envs = await load.envs()
  const questions = [
    {
      name: 'env',
      message: 'Environment',
      type: 'list',
      choices: () => envs
    }
  ]

  const inputs = await inquirer.prompt(questions.filter((q) => !opts[q.name]))
  const { common, differences, conflicts } = await configList(merge({}, inputs, opts))

  if (!opts.quiet) {
    if (opts.json) {
      console.log(JSON.stringify(common, undefined, 2))
    } else {
      const output = values(common).map(({ key, value }) => `${key}=${value}`)
      let errors = []

      if (Object.keys(differences).length !== 0) {
        errors.push('Variables that are present on some functions:')
        errors = errors.concat(values(differences).map(({ key, value }) => `${key}=${value.value} on the following functions: ${value.functions.join(', ')}`))
      }

      if (Object.keys(conflicts).length !== 0) {
        errors.push('Variables that have conflicting values across different functions')
        errors = errors.concat(values(conflicts).map(({ key, value }) => {
          const funcValues = values(value).map((obj) => `\t${key}=${obj.value} on ${obj.key}`)
          return `Variable: ${key}\n${funcValues.join('\n')}`
        }))
      }

      console.log(output.join('\n'))
      if (errors.length !== 0) { console.error(errors.join('\n')) }
    }
  }
}
