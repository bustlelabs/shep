import inquirer from 'inquirer'
import deploy from '../deploy'
import loadEnvs from '../util/load-envs'
import { merge } from 'lodash'

export const command = 'deploy [env] [functions..]'
export const desc = 'Deploy both functions and APIs to AWS. Will create a new API if the ID is not specified'
export function builder (yargs){
  return yargs
  .pkgConf('shep', process.cwd())
  .describe('api-id', 'The API Gateway API id. Read from package.json if not provided.')
  .require('api-id')
  .describe('concurrency', 'Number of functions to build and upload at one time')
  .default('concurrency', Infinity)
  .alias('concurrency', 'c')
  .describe('build', 'Build functions before deployment. Use --no-build to skip this step')
  .default('build', true)
  .example('shep deploy production', 'Deploy all functions with production env variables')
  .example('shep deploy production --no-build', 'Deploy all functions as currently built in the dist folder')
  .example('shep deploy production create-user', 'Deploy only the create-user function')
  .example('shep deploy production *-user', 'Deploy only functions matching the pattern *-user')
}

export function handler(opts) {
  const questions = [
    {
      name: 'env',
      message: 'Environment',
      type: 'list',
      choices: () => loadEnvs()
    }
  ]

  inquirer.prompt(questions.filter((q)=> !opts[q.name] ))
  .then((inputs) => merge({}, inputs, opts) )
  .then(deploy)
}
