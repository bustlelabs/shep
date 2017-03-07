import * as load from '../../util/load'
import parseApi from '../../util/parse-api'

export default function () {
  const parsedApi = parseApi(load.api())
  const unaliasedEndpoints = parsedApi.filter(hasNoAlias)

  return unaliasedEndpoints.map(generateWarnings)
}

function hasNoAlias ({ integration }) {
  const uri = integration.uri
  const aliasString = '${stageVariables.functionAlias}' // eslint-disable-line no-template-curly-in-string

  return uri && uri.indexOf(aliasString) === -1
}

function generateWarnings ({ path, method }) {
  return {
    rule: 'unaliased-uri',
    type: 'error',
    message: `The integration of ${path} ${method.toUpperCase()} isn't aliased.`
  }
}
