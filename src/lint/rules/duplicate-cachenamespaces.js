import * as load from '../../util/load'
import parseApi from '../../util/parse-api'

export default function () {
  const api = load.api()
  if (!api) { return [] }

  const parsedApi = parseApi(api)

  const partitionByCache = parsedApi
    .filter((endpoint) => endpoint.integration !== undefined)
    .reduce((acc, endpoint) => {
      const currentNamespace = endpoint.integration.cacheNamespace
      if (currentNamespace === undefined) return acc
      if (acc[currentNamespace] === undefined) {
        acc[currentNamespace] = [endpoint]
      } else {
        acc[currentNamespace].push(endpoint)
      }
      return acc
    }, {})

  const duplicateNamespaces = Object.keys(partitionByCache)
          .map((cacheName) => partitionByCache[cacheName])
          .filter((partition) => partition.length > 1)

  return duplicateNamespaces.map(generateWarnings)
}

function generateWarnings (partition) {
  const nameSpace = partition[0].integration.cacheNamespace
  const endpoints = partition.map(({ path, method }) => {
    return `${path} ${method.toUpperCase()}`
  }).join('\n')
  return {
    rule: 'duplicate-cachenamespaces',
    message: `${nameSpace} is shared by the following: \n${endpoints}`
  }
}
