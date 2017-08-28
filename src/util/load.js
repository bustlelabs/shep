import isEqual from 'lodash.isequal'
import path from 'path'
import Promise from 'bluebird'
import { readdir, readJSON } from './modules/fs'
import minimatch from 'minimatch'
import { listAliases, isFunctionDeployed } from './aws/lambda'

export async function envs () {
  const functionLambdaConfigs = await Promise.map(funcs(), lambdaConfig).map(({ FunctionName }) => FunctionName)

  const deployedFunctions = await Promise.filter(functionLambdaConfigs, (name) => isFunctionDeployed(name))
  if (deployedFunctions.length <= 0) {
    throw new Error('No deployed functions')
  }

  const allFunctionAliases = await Promise.map(deployedFunctions, async name => {
    const aliases = await listAliases(name).map(({ Name }) => Name)
    return aliases.sort()
  })

  const aliases = allFunctionAliases.pop().sort()
  if (aliases.length === 0) {
    throw new AliasesNotFound()
  }

  allFunctionAliases.forEach(functionAliases => {
    if (!isEqual(aliases, functionAliases)) {
      throw new EnvironmentMismatch()
    }
  })

  return aliases
}

export async function events (func, eventName) {
  const eventDir = `functions/${func}/events`
  let events = await readdir(`functions/${func}/events`)
  if (eventName) {
    events = events.filter((event) => event === `${eventName}.json`)
    if (events.length === 0) {
      throw new EventNotFound({ eventDir, eventName })
    }
  }

  return events
}

export async function funcs (pattern = '*') {
  const funcs = await readdir('functions').filter(minimatch.filter(pattern))
  if (funcs.length === 0) {
    throw new FunctionNotFound(pattern)
  }
  return funcs
}

export async function lambdaConfig (name) {
  const functionConfig = await readJSON(`functions/${name}/lambda.json`)
  const projectConfig = await readJSON(`lambda.json`)

  return Object.assign({}, projectConfig, functionConfig)
}

export async function pkg () {
  const pkg = await readJSON('package.json')
  if (!pkg || !pkg.shep) { throw new MissingShepConfiguration() }
  return pkg
}

export async function distPath (joinedPath) {
  const { shep: { dist = 'dist' } } = await pkg()
  if (joinedPath) {
    return path.join(dist, joinedPath)
  }
  return dist
}

export async function api () {
  try {
    const api = await readJSON('api.json')
    return api
  } catch (e) {
    return null
  }
}

export function babelrc () {
  return readJSON('.babelrc')
}

export class EnvironmentMismatch extends Error {
  constructor () {
    super()
    this.message = 'Mismatched aliases found, please run `shep config sync` to ensure all functions have the same environment'
    this.name = 'EnvironmentMismatch'
  }
}

export class EventNotFound extends Error {
  constructor ({ eventDir, eventName }) {
    const message = `No event in '${eventDir}' called ${eventName}`
    super(message)
    this.message = message
    this.name = 'EventNotFound'
  }
}

export class FunctionNotFound extends Error {
  constructor (pattern) {
    const message = `No functions found matching patterns: ${JSON.stringify(pattern)}`
    super(message)
    this.message = message
    this.name = 'FunctionNotFound'
  }
}

export class AliasesNotFound extends Error {
  constructor () {
    super()
    this.message = 'Cannot load available aliases, to create an alias use `shep deploy --env beta`'
    this.name = 'AliasesNotFound'
  }
}

export class MissingShepConfiguration extends Error {
  constructor (message) {
    const msg = message || 'Missing shep section in package.json'
    super(msg)
    this.message = msg
    this.name = 'MissingShepConfiguration'
  }
}
