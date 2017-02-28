export default function (api) {
  if (!api) { return [] }

  const paths = Object.keys(api.paths)

  const methods = paths.reduce((acc, path) => {
    const nestedMethods = Object.keys(api.paths[path]).map((method) => {
      return { path, method }
    })
    return acc.concat(nestedMethods)
  }, [])

  const functions = methods.map(({ path, method }) => {
    const integration = api.paths[path][method]['x-amazon-apigateway-integration']
    if (!integration) { return { path, method } }
    if (integration.type !== 'aws_proxy') { return { path, method } }
    return { path, method, uri: api.paths[path][method]['x-amazon-apigateway-integration'].uri }
  })

  return functions
}
