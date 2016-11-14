import exec from './modules/exec'

export default function (PATTERN, NODE_ENV) {
  return exec('webpack', ['--bail'], { env: { PATTERN, NODE_ENV } })
}
