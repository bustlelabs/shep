import inquirer from 'inquirer'
import merge from 'lodash.merge'
import reporter from '../../util/reporter'
import generateEndpoint from '../../generate-endpoint'

const httpMethods = ['get', 'post', 'put', 'delete', 'options', 'any']

export const command = 'endpoint [path]'
export const desc = 'Generate a new API endpoint'
export function builder (yargs) {
  return yargs
  .pkgConf('shep', process.cwd())
  .describe('method', 'HTTP Method')
  .choices('method', httpMethods)
  .describe('quiet', 'Don\'t log anything')
  .default('quiet', false)
  .alias('q', 'quiet')
}

export async function handler (opts) {
  const questions = [
    {
      name: 'path',
      type: 'input',
      message: 'Endpoint path',
      default: '/users/{id}',
      validate: (val) => val === '' ? 'Path cannot be blank' : true
    },
    {
      name: 'method',
      type: 'list',
      message: 'HTTP method',
      choices: httpMethods
    }
  ]

  if (!opts.quiet) { opts.logger = reporter() }
  const inputs = await inquirer.prompt(questions.filter((q) => !opts[q.name]))
  return generateEndpoint(merge({}, inputs, opts))
}
