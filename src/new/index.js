import { mkdir, writeFile } from '../util/modules/fs'
import { getRole, createRole, attachPolicy } from '../util/aws/iam'
import * as templates from './templates'
import Promise from 'bluebird'
import exec from '../util/modules/exec'
import listr from '../util/modules/listr'

export default function run (opts) {
  const path = opts.path
  const rolename = opts.rolename
  const region = opts.region

  let tasks = [
    {
      title: `Setup IAM Role`,
      task: setupIam
    },
    {
      title: `Create ${path}/`,
      task: () => mkdir(path)
    },
    {
      title: 'Create Subdirectories',
      task: createSubDirs
    },
    {
      title: 'Create Files',
      task: createFiles
    },
    {
      title: 'Install Depedencies',
      task: npmInstall
    },
    {
      title: 'Initialize Git',
      task: initGit
    }
  ]

  if (!rolename) tasks = tasks.splice(1)

  return listr(tasks, opts.quiet)
    .run({ path, rolename, region })
}

function setupIam (context) {
  const rolename = context.rolename
  let newRole = false

  return getRole(rolename)
  .catch({ code: 'NoSuchEntity' }, () => {
    newRole = true
    return createRole(rolename)
  })
  .tap(arn => {
    context.arn = arn
  })
  .then(() => { if (newRole) return attachPolicy(rolename) })
  .catch({ code: 'LimitExceeded' }, () => {
    return Promise.reject('Current AWS User does not have sufficient permissions to do this')
  })
}

function createSubDirs ({ path }) {
  return Promise.all([
    mkdir(path + '/functions'),
    mkdir(path + '/config')
  ])
}

function createFiles ({ path, arn, region }) {
  const accountId = (/[0-9]{12}(?=:)/.exec(arn) || [ '' ])[0]

  return Promise.all([
    writeFile(path + '/package.json', templates.pkg({ apiName: path, region, accountId })),
    writeFile(path + '/config/development.js', templates.env('development')),
    writeFile(path + '/config/beta.js', templates.env('beta')),
    writeFile(path + '/config/production.js', templates.env('production')),
    writeFile(path + '/.gitignore', templates.gitignore()),
    writeFile(path + '/README.md', templates.readme(path)),
    writeFile(path + '/lambda.json', templates.lambda(arn)),
    writeFile(path + '/api.json', templates.api(path)),
    writeFile(path + '/webpack.config.js', templates.webpack())
  ])
}

function npmInstall ({ path }) {
  return exec('npm', ['install'], { cwd: path })
}

function initGit ({ path }) {
  return exec('git', ['init'], { cwd: path })
}
