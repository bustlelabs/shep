export function getMatchingEndpoint (request, endpoints) {
  // sort routes
  // for (var i = 0; i < endpoints.length; i++) {
  //   endpoints[i].path
  // }
  //
  // endpoints = endpoints.sort((a, b) => {
  //   return a.path.indexOf('+') > b.path.indexOf('+') ||
  //          a.path.indexOf('{') > b.path.indexOf('{')
  // })

  for (var i = 0; i < endpoints.length; i++) {
    if (endpoints[i].method.toUpperCase() === 'ANY' || endpoints[i].method.toUpperCase() === request.method) {
      const match = matchEndpointPath(request.url.pathname, endpoints[i].path)
      if (match.found) {
        return Object.assign({}, endpoints[i], { pathParams: match.pathParams })
      }
    }
  }
  // match NotFound
  return null
}

export function matchEndpointPath (url, endpointPath) {
  const urlSegments = url.split('/').slice(1)
  const endpointSegments = endpointPath.split('/').slice(1)

  if (urlSegments.length !== endpointSegments.length) {
    return { found: false, pathParams: null }
  }

  let pathParams = null

  // resourceSegments, urlSegments - lengths are same
  for (let i = 0; i < endpointSegments.length; i++) {
    // if path param, capture its value
    if (endpointSegments[i][0] === '{' && urlSegments[i]) {
      const param = endpointSegments[i].slice(1, -1)
      const paramValue = null

      if (param.slice(-1) === '+') {
        paramValue = urlSegments[i].split('/')
        param = param.slice(-1)
      } else {
        paramValue = urlSegments[i]
      }
      pathParams = Object.assign({}, pathParams, {
        [param]: paramValue
      })
    } else if (endpointSegments[i] !== urlSegments[i]) {
      return {
        found: false,
        pathParams: null
      }
    }
  }

  return {
    found: true,
    pathParams: pathParams
  }
}

export function getEventFromRequest (request, { endpoint, env }) {
  // url.query will be {} when no params given, but aws expects it as null
  const queryParams = Object.keys(request.url.query).length ? request.url.query : null

  return {
    name: 'http-request',
    data: {
      resource: endpoint.path,
      path: request.url.pathname,
      httpMethod: request.method,
      headers: request.headers,
      queryStringParameters: queryParams, // {} or null
      pathParameters: endpoint.pathParams, // {} or null
      stageVariables: { functionAlias: env || 'development' },
      body: request.body // data or null
    }
  }
}
