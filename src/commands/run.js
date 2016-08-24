import inquirer from 'inquirer'
import run from '../run'
import loadFuncs from '../util/load-funcs'
import { merge } from 'lodash'

export const command = 'run [name]'
export const desc = 'Run a function in your local environemnt'
export function builder (yargs){
  return yargs
  .pkgConf('shep', process.cwd())
  .describe('environment', 'Environment variables to use')
  .describe('event', 'Event to use')
  .default('environment', 'development')
  .describe('build', 'Build functions before running. Use --no-build to skip this step')
  .default('build', true)
  .example('shep run', 'Launch an interactive CLI')
  .example('shep run foo', 'Runs the `foo` function for all events')
  .example('shep run foo --no-build', 'Run the already built `foo` function in the dist folder')
  .example('shep run foo --event default', 'Runs the `foo` function for just the `default` event')
  .example('shep run foo --environment production', 'Runs the `foo` function with production environment')
}

export function handler(opts) {
  const questions = [
    {
      name: 'name',
      message: 'Function',
      type: 'list',
      choices: () => loadFuncs()
    }
  ]

  inquirer.prompt(questions.filter((q)=> !opts[q.name] ))
  .then((inputs) => merge({}, inputs, opts) )
  .then(run)
}
