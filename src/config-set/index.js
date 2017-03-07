import upload from '../util/upload-environment'
import listr from '../util/modules/listr'
import AWS from 'aws-sdk'

export default function (opts) {
  const env = opts.env || 'development'

  AWS.config.update({region: opts.region})

  const tasks = listr([
    {
      title: 'Set environment variables on functions in AWS',
      task: () => upload(env, opts.vars)
    }
  ])

  return tasks.run()
}
