import * as rules from './rules'

export default function (opts) {
  // load all rules
  // run all rules
  const ruleNames = Object.keys(rules).filter((name) => name !== 'toString' && name !== 'default')
  const warnings = ruleNames.map((name) => {
    return rules[name](opts)
  })
  // concat warnings
  const flatWarnings = warnings.reduce((com, a) => com.concat(a), [])
  // print warnings
  if (!opts.quiet) { console.log(flatWarnings) }
  // return warnings
  return flatWarnings
}

