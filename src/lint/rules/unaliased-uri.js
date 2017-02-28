import * as load from '../../util/load'
import parseApi from '../../util/parse-api'

export default function () {
  const parsedApi = parseApi(load.api())

  const unaliasedEndpoints = parsedApi.filter(({ integration }) => {
    return integration.uri && integration.uri.indexOf('${stageVariables.functionAlias}') === -1 // eslint-disable-line no-template-curly-in-string
  })

  return unaliasedEndpoints.map(generateWarnings)
}

function generateWarnings ({ path, method }) {
  return {
    rule: 'unaliased-uri',
    message: `The integration of ${path} ${method.toUpperCase()} isn't aliased.`
  }
}
