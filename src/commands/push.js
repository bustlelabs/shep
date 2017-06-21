import listr from '../util/modules/listr'
import push from '../push'

export const command = 'push'
export const desc = 'Create a new shep project'
export function builder (yargs) {
  return yargs
  .pkgConf('shep', process.cwd())
  .describe('api-id', 'API Gateway resource id. Read from package.json if not provided')
  .require('api-id')
  .describe('region', 'AWS region. Read from package.json if not provided')
  .require('region')
  .describe('quiet', 'Don\'t log anything')
  .default('quiet', false)
  .alias('q', 'quiet')
  .example('shep push', 'Pushes the api.json swagger configuration to API Gateway. Does not deploy the API.')
  .example('shep push --api-id foo --region us-east-1')
}

export function handler (opts) {
  const tasks = listr([
    {
      title: `Upload api.json to AWS`,
      task: () => push(opts)
    }
  ], opts.quiet)

  return tasks.run()
}
