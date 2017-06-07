export function environmentCheck (envs) {
  const extractedEnvs = values(envs)

  return Object.keys(envs).reduce(({ common, differences, conflicts }, func) => {
    const env = envs[func]

    Object.keys(env).forEach((envVar) => {
      if (common[envVar] || differences[envVar] || conflicts[envVar]) { return }

      const hasMatchingKeyValue = matchingKeyValue(envVar, env[envVar])
      const keyIsUndefinedOrSame = undefinedOrSame(envVar, env[envVar])

      if (extractedEnvs.every(hasMatchingKeyValue)) {
        common[envVar] = env[envVar]
      } else if (!extractedEnvs.every(keyIsUndefinedOrSame)) {
        conflicts[envVar] = extractedEnvs
        .filter((obj) => !keyIsUndefinedOrSame(obj))
        .reduce((acc, { key, value }) => {
          acc[key] = value[envVar]
          return acc
        }, {})

        // Add the current function to conflicts
        conflicts[envVar][func] = env[envVar]
      } else {
        const funcsWithVarPresent = extractedEnvs
        .filter(hasMatchingKeyValue)
        .map(({ key, value }) => key)

        differences[envVar] = { value: env[envVar], functions: funcsWithVarPresent }
      }
    })

    return { common, differences, conflicts }
  }, { common: {}, differences: {}, conflicts: {} })
}

function matchingKeyValue (masterKey, masterValue) {
  return ({ key, value }) => {
    return value[masterKey] === masterValue
  }
}

function undefinedOrSame (masterKey, masterValue) {
  return ({ key, value }) => {
    return value[masterKey] === undefined || value[masterKey] === masterValue
  }
}

export function values (obj) {
  return Object.keys(obj).map((key) => {
    return { key, value: obj[key] }
  })
}
