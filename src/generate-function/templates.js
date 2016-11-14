export function index () {
  return `import config from 'shep-config'

export function handler(event, context, callback) {
  // Replace below with your own code!
  console.log(JSON.stringify(event))
  console.log(JSON.stringify(context))
  console.log(JSON.stringify(config))

  callback(null, { statusCode: 200, headers: {}, body: 'success!' })
}`
}

export function event () {
  let obj = {
    resource: '',
    path: '',
    httpMethod: 'GET',
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    stageVariables: {},
    body: null
  }

  return JSON.stringify(obj, null, 2)
}

export function lambda (name) {
  let obj = {
    FunctionName: name,
    Description: ''
  }

  return JSON.stringify(obj, null, 2)
}
