export function api (apiName) {
  return `{
  "swagger": "2.0",
  "info": {
    "title": "${apiName}"
  },
  "schemes": [ "https" ],
  "paths": {}
}
`
}

export function env (env) {
  return `module.exports = {
  env: "${env}",
  secretkey: "${env}-secret-key"
}
`
}

export function gitignore () {
  return `dist/*
node_modules/*
config/*
`
}

export function lambda (arn = '') {
  let obj = {
    Handler: 'index.handler',
    MemorySize: 128,
    Role: arn,
    Timeout: 10,
    Runtime: 'nodejs4.3'
  }

  return JSON.stringify(obj, null, 2)
}

export function lambdaRole () {
  return `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}`
}

export function pkg ({ apiName, accountId = '', region = '' }) {
  const version = require('../index').version
  let obj = {
    name: apiName,
    version: '1.0.0',
    private: true,
    description: '',
    license: '',
    devDependencies: {
      webpack: '2.1.0-beta.25',
      minimatch: '3.0.3',
      shep: version
    },
    shep: {
      region: region,
      accountId: accountId,
      apiId: ''
    }
  }

  return JSON.stringify(obj, null, 2)
}

export function readme (apiName) {
  return `# ${apiName}
`
}

export function webpack () {
  return `/*
 * WARNING: Tampering with how entry is populated could affect pattern matching
 */

const fs = require('fs')
const path = require('path')
const minimatch = require('minimatch')

const env = process.env.NODE_ENV || 'development'
const pattern = process.env.PATTERN || '*'

const entry = fs.readdirSync('functions')
  .filter(minimatch.filter(pattern))
  .reduce((map, funcName) => {
    map[funcName] = path.resolve(\`functions/\${funcName}/index\`)
    return map
  }, {})

module.exports = {
  target: 'node',
  entry,
  output: {
    path: 'dist',
    filename: '[name]/index.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    modules: [ 'node_modules', 'lib' ],
    alias: {
      'shep-config': path.resolve(\`config/\${env}.js\`)
    }
  }
}
`
}
