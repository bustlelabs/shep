/* eslint import/namespace: ['error', { allowComputed: true }] */
import * as rules from './rules'

export default function (opts) {
  const log = logger(opts.verbose)
  const ruleNames = Object.keys(rules).filter((name) => name !== 'toString' && name !== 'default')
  const warnings = ruleNames.map((name) => {
    return rules[name](opts)
  })
  const flatWarnings = warnings.reduce((com, a) => com.concat(a), [])

  if (!opts.quiet) { flatWarnings.forEach(log) }

  const errors = warnings.filter(({ type }) => type === 'error').map(({ message }) => message)

  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(errors.length)
  }

  return flatWarnings
}

function logger (verbose) {
  return ({ rule, message }) => {
    if (verbose) { console.log(rule) }
    console.log(message + '\n')
  }
}
