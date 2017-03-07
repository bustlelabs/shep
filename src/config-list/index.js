import getEnvironment from '../util/get-environment'
import AWS from 'aws-sdk'

export default function (opts) {
  const name = opts.function
  const env = opts.env || 'development'

  AWS.config.update({region: opts.region})

  console.log(`Listing environment variables for ${name}...`, '\n')

  getEnvironment(env, name)
  .then((vars) => {
    if (vars && vars.length > 0) {
      const envObj = vars[0]
      Object.keys(envObj).forEach((key) => {
        console.log(key, '=', envObj[key])
      })
      console.log('')
    } else {
      console.log(`No environment vars on AWS for ${name}`)
    }
  })
}
