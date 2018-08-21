import build from '../util/build-functions'

export default function ({ functions = '*', env = 'development', quiet }) {
  return build(functions, env, { quiet })
}
