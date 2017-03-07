import remove from '../util/remove-environment'
import listr from '../util/modules/listr'
import AWS from 'aws-sdk'

export default function (opts) {
  const env = opts.env || 'development'

  AWS.config.update({region: opts.region})

  const tasks = listr([
    {
      title: 'Remove environment variables on functions in AWS',
      task: () => remove(env, opts.vars)
    }
  ])

  return tasks.run()
}
