import uploadEnvironment from '../util/upload-environment'

export default function ({ env = 'development', vars }) {
  return uploadEnvironment(env, vars)
}
