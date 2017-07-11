import path from 'path'
import { readdir, readJSON } from './modules/fs'
import minimatch from 'minimatch'
import { listAliases, isFunctionDeployed } from './aws/lambda'
import Promise from 'bluebird'

export async function envs () {
  const fullFuncNames = await Promise.map(this.funcs(), this.lambdaConfig)
  .map(({ FunctionName }) => FunctionName)

  const deployedFunctions = await Promise.filter(fullFuncNames, isFunctionDeployed)
  const allAliases = await Promise.map(deployedFunctions, (name) => listAliases(name).map(({ Name }) => Name))

  const aliases = allAliases.reduce((acc, aliasSet) => {
    const missingAliases = aliasSet.filter((alias) => acc.indexOf(alias) === -1)
          .concat(acc.filter((alias) => aliasSet.indexOf(alias) === -1))

    if (missingAliases.length !== 0) {
      throw new EnvironmentMismatch()
    }

    return acc
  }, allAliases.pop())

  if (!aliases || aliases.length === 0) { throw new AliasesNotFound() }

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
  } else {
    return funcs
  }
}

export async function lambdaConfig (name) {
  const functionConfig = await readJSON(`functions/${name}/lambda.json`)
  const projectConfig = await readJSON(`lambda.json`)

  return Object.assign(projectConfig, functionConfig)
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
