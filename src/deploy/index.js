import Promise from 'bluebird'
import loadFuncs from '../util/load-funcs'
import build from '../util/build-function'
import upload from '../util/upload-function'
import { deployApi } from '../util/api-gateway'
import { setPermission, setAlias } from '../util/lambda'
import pushApi from '../push'
import AWS from 'aws-sdk'
import { queue, done } from '../util/tasks'
import fs from 'fs-extra-promise'

const pushApiTask = 'Upload api.json'
const aliasesTask = 'Promote function aliases'
const permissionsTask = 'Setup API Gateway <-> Lamda Permissions'
const deployTask = 'Deploy API'

export default function(opts){
  const functions = loadFuncs(opts.functions)
  const concurrency = opts.concurrency || Infinity
  const env = opts.env
  const region = opts.region
  const performBuild = opts.build

  let api
  try {
    api = fs.readJSONSync(`api.json`)
  } catch(e) {
    console.log('No api.json file found. Skipping API deployment steps')
  }

  AWS.config.update({region: region})

  return Promise.resolve(functions)
  .each(queue)
  .tap(() => {
    if (api) {
      queue(pushApiTask)
      queue(aliasesTask)
      queue(permissionsTask)
      queue(deployTask)
    } else {
      queue(aliasesTask)
    }
  })
  .map((func) => buildAndUploadFunction(func).tap(() => done(func)), { concurrency })
  .then((funcs) => api ? pushAndDeployApi(funcs) : promoteAliases(funcs) )


  function promoteAliases(funcs){
    return Promise.resolve(funcs)
    .map((func) => setAlias(func, env) )
    .tap(() => done(aliasesTask))
  }
  function buildAndUploadFunction(name) {
    return Promise.resolve()
    .then(() => { if (performBuild === true) return build(name, env) })
    .then(() => upload(name) )
  }

  function pushAndDeployApi(funcs){
    return pushApi(opts)
    .tap(() => done(pushApiTask))
    .then((id) => {
      return Promise.resolve(funcs)
      .map((func) => setAlias(func, env))
      .tap(() => done(aliasesTask))
      .map((alias) => setPermission(alias, id) )
      .tap(() => done(permissionsTask))
      .return(id)
    })
    .then((id) => deployApi(id, env))
    .tap(() => done(deployTask))
  }
}
