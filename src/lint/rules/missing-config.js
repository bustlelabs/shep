import { funcs, lambdaConfig } from '../../util/load'
export default function () {
  const funcNames = funcs('*')
  const configs = funcNames.map(lambdaConfig)
  const warnConfigs = configs.filter(missingDescription)
  return warnConfigs.map(generateWarning)
}

function missingDescription (config) {
  return !config.Description
}

function generateWarning (config) {
  return {
    rule: 'missing-description',
    message: `Function ${config.FunctionName} has no description set`
  }
}
