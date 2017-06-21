import { mkdirp, writeFile, exists } from '../util/modules/fs'
import { getRole, createRole, attachPolicy } from '../util/aws/iam'
import * as templates from './templates'
import Promise from 'bluebird'
import exec from '../util/modules/exec'

let conflictingFiles = false

export default async function run ({ path, rolename, region, logger = () => {} }) {
  let arn

  if (rolename) {
    logger({ type: 'start', body: `Setup IAM Role` })
    arn = await setupIam({ rolename })
  }

  logger({ type: 'start', body: `Create ${path}/` })
  await mkdirp(path)

  logger({ type: 'start', body: 'Create Subdirectories' })
  await createSubDirs({ path })

  logger({ type: 'start', body: 'Create Files' })
  await createFiles({ path, arn, region })

  logger({ type: 'start', body: 'Install Depedencies' })
  await npmInstall({ path })

  logger({ type: 'done' })

  if (conflictingFiles) { logger('Conflicting files were found in provided path. New files were written with .shep-tmp appended to the filename') }
  return path
}

async function setupIam (context) {
  const rolename = context.rolename

  let arn
  try {
    arn = await getRole(rolename)
  } catch (e) {
    if (e.code !== 'NoSuchEntity') { throw e }
    arn = await createRole(rolename)
    await attachPolicy(rolename)
  }
  return arn
}

function createSubDirs ({ path }) {
  return Promise.all([
    mkdirp(path + '/functions')
  ])
}

function createFiles ({ path, arn, region }) {
  const accountId = (/[0-9]{12}(?=:)/.exec(arn) || [ '' ])[0]
  const files = [
    { path: `${path}/package.json`, contents: templates.pkg({ apiName: path, region, accountId }) },
    { path: `${path}/.gitignore`, contents: templates.gitignore() },
    { path: `${path}/.env`, contents: templates.dotEnv() },
    { path: `${path}/README.md`, contents: templates.readme(path) },
    { path: `${path}/lambda.json`, contents: templates.lambda(arn) },
    { path: `${path}/api.json`, contents: templates.api(path) },
    { path: `${path}/webpack.config.js`, contents: templates.webpack() },
    { path: `${path}/.babelrc`, contents: templates.babelrc() }
  ]

  return Promise.map(files, tempifyFile)
  .map(({ path, contents }) => writeFile(path, contents))
}

async function tempifyFile ({ path, contents }) {
  if (await exists(path)) {
    conflictingFiles = true
    return { path: `${path}.shep-tmp`, contents }
  }
  return { path, contents }
}

function npmInstall ({ path }) {
  return exec('npm install', { cwd: path })
}
