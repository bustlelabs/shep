import inquirer from 'inquirer'
import merge from 'lodash.merge'
import reporter from '../util/reporter'
import _new from '../new'

const questions = [
  {
    type: 'input',
    name: 'path',
    message: 'Project folder name',
    default: 'my-api'
  },
  {
    type: 'input',
    name: 'region',
    message: 'Region for project',
    default: 'us-east-1',
    config: true
  },
  {
    type: 'input',
    name: 'rolename',
    message: 'Enter the name of the IAM role which you wish to use, if it is not found it will be created',
    default: 'shepRole',
    config: true
  }
]

export const command = 'new [path]'
export const desc = 'Create a new shep project'
export function builder (yargs) {
  return yargs
  .describe('path', 'Location to create the new shep project')
  .boolean('skip-config')
  .describe('skip-config', 'Skips configuring shep project')
  .describe('region', 'Region for new shep project')
  .describe('rolename', 'Name of IAM Role which will be used to execute Lambda functions')
  .describe('quiet', 'Don\'t log anything')
  .default('quiet', false)
  .alias('q', 'quiet')
  .example('shep new', 'Launch an interactive CLI')
  .example('shep new my-api', 'Generates a project at `my-api`')
}

export async function handler (opts) {
  const inputs = await inquirer.prompt(questions.filter((q) => !opts[q.name] && (!opts.skipConfig || !q.config)))
  if (!opts.quiet) { opts.logger = reporter() }
  return _new(merge({}, inputs, opts))
}
