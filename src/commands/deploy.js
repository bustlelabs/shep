import inquirer from 'inquirer'
import deploy from '../deploy'
import * as load from '../util/load'
import reporter from '../util/reporter'
import merge from 'lodash.merge'

export const command = 'deploy'
export const desc = 'Deploy both functions and APIs to AWS. Will create a new API if the ID is not specified'
export function builder (yargs) {
  return yargs
  .pkgConf('shep', process.cwd())
  .describe('build', 'Build functions before deployment. Use --no-build to skip this step')
  .default('build', true)
  .describe('quiet', 'Don\'t log anything')
  .default('quiet', false)
  .alias('q', 'quiet')
  .describe('env', 'Environment you want to deploy to, if it doesn\'t exist it will be created')
  .alias('e', 'env')
  .describe('functions', 'Functions you wish to build and deploy')
  .example('shep deploy', 'Launch an interactive CLI')
  .example('shep deploy --env production', 'Deploy all functions with production env variables')
  .example('shep deploy --env beta --no-build', 'Deploy all functions as currently built in the dist folder')
  .example('shep deploy --env production --functions create-user', 'Deploy only the create-user function')
  .example('shep deploy --env beta --functions \'*-user\'', 'Deploy only functions matching the pattern *-user')
}

export async function handler (opts) {
  const envs = await load.envs()

  if (!opts.env && !(envs && envs.length !== 0)) {
    throw new Error('No environments found, use the --env flag to create a new one')
  }

  const deployArgs = merge({}, opts)
  if (!opts.quiet) { deployArgs.logger = reporter() }
  if (envs && envs.length > 0) {
    const questions = [
      {
        name: 'env',
        message: 'Environment',
        type: 'list',
        choices: () => envs
      }
    ]

    const inputs = await inquirer.prompt(questions.filter((q) => !opts[q.name]))
    merge(deployArgs, inputs)
  }

  return deploy(deployArgs)
}
