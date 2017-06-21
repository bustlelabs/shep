import pull from '../pull'
import reporter from '../util/reporter'

export const command = 'pull'
export const desc = 'Pulls a swagger JSON representation of an existing API and writes it to a local file'
export function builder (yargs) {
  return yargs
  .pkgConf('shep', process.cwd())
  .describe('region', 'AWS region')
  .require('region')
  .alias('region', 'r')
  .describe('stage', 'AWS API Gateway stage. Read from the shep config in package.json if not provided')
  .require('stage')
  .alias('stage', 's')
  .describe('api-id', 'AWS API Gateway ID. Read from the shep config in package.json if not provided')
  .require('api-id')
  .alias('api-id', 'a')
  .describe('output', 'Path of the file to output')
  .default('output', 'api.json')
  .alias('output', 'o')
  .default('build', true)
  .describe('quiet', 'Don\'t log anything')
  .default('quiet', false)
  .alias('q', 'quiet')
  .example('shep pull', 'Download a JSON swagger file for `apiId` in package.json and prompts for stage via interactive CLI')
  .example('shep pull --api-id foo --stage bar', 'Downloads a JSON swagger file for stage `bar` of API id `foo`')
  .example('shep pull --output other-path.json', 'Writes the JSON swagger file to `other-path.json`')
}

export function handler (opts) {
  if (!opts.quiet) { opts.logger = reporter() }
  return pull(opts)
}
