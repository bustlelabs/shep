import * as load from '../../util/load'
import parseApi from '../../util/parse-api'

export default function () {
  const api = load.api()
  if (!api) { return [] }

  const parsedApi = parseApi(api)

  const partitionedByCache = parsedApi
    .filter(hasIntegration)
    .reduce(partitionByCache, {})

  const duplicateNamespaces = Object.keys(partitionedByCache)
          .map((cacheName) => partitionedByCache[cacheName])
          .filter((partition) => partition.length > 1)

  return duplicateNamespaces.map(generateWarnings)
}

function hasIntegration ({ integration }) {
  return integration !== undefined
}

function partitionByCache (acc, endpoint) {
  const currentNamespace = endpoint.integration.cacheNamespace
  if (currentNamespace === undefined) return acc
  if (acc[currentNamespace] === undefined) {
    acc[currentNamespace] = [endpoint]
  } else {
    acc[currentNamespace].push(endpoint)
  }
  return acc
}

function generateWarnings (partition) {
  const nameSpace = partition[0].integration.cacheNamespace
  const endpoints = partition.map(({ path, method }) => {
    return `  ${path} ${method.toUpperCase()}`
  }).join('\n')
  return {
    rule: 'duplicate-cachenamespaces',
    message: `cacheNamespace '${nameSpace}' is shared by the following: \n${endpoints}`
  }
}
