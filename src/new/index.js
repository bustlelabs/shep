import { mkdir, writeFile } from '../util/modules/fs'
import { getRole, createRole } from '../util/aws/iam'
import * as templates from './templates'
import Promise from 'bluebird'
import exec from '../util/modules/exec'
import listr from '../util/modules/listr'

export default function run (opts) {
  const path = opts.path
  const rolename = opts.rolename
  const region = opts.region

  const tasks = listr([
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
  ], opts.quiet)

  return tasks.run({ path, rolename, region })
}

function setupIam (context) {
  const rolename = context.rolename

  if (!rolename) {
    return Promise.resolve()
  }

  return getRole(rolename)
  .catch(err => {
    if (err.statusCode === 404) return createRole(rolename)
    return Promise.reject(err)
  })
  .tap(arn => {
    context.arn = arn
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
