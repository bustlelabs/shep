import inquirer from 'inquirer'
import { kebabCase } from 'lodash'
import loadFuncs from '../../util/load-funcs'
import generateEndpoint from '../../generate/endpoint'

const httpMethods = ['get','post','put','delete','options']

export const command = 'endpoint [path]'
export const desc = 'Generate a new API endpoint'
export function builder (yargs){
  return yargs
  .describe('method', 'HTTP Method')
  .choices('method', httpMethods)
  .describe('response-code', 'Default response code')
  .default('response-code', 200)
  .describe('content-type', 'Default response content type')
  .default('content-type', 'application/json')
  .describe('function-name', 'Lambda function name')
  .default('function-name', null, 'kebabCase(projectName path method)')
}

export function handler () {
  inquirer.prompt([
    {
      name: 'path',
      type: 'input',
      message: 'Endpoint path',
      default: '/posts/{id}',
      validate: (val) => val === '' ? 'Path cannot be blank' : true
    },
    {
      name: 'method',
      type: 'list',
      message: 'HTTP method',
      choices: httpMethods
    },
    {
      name: 'contentType',
      message: 'Response content type',
      default: 'application/json'
    },
    {
      name: 'responseCode',
      message: 'Success response code',
      default: '200'
    },
    {
      name: 'cors',
      type: 'confirm',
      message: 'Enable CORS?'
    },
    {
      name: 'createFunction',
      message: 'Do you want to generate a new function or use an existing one?',
      type: 'list',
      choices: [{ name: 'Generate New', value: true }, { name: 'Use Existing', value: false }]
    },
    {
      name: 'functionName',
      message: 'Function name',
      type: 'input',
      default: (answers) => kebabCase(`${answers.path} ${answers.method}`),
      when: (answers) => answers.createFunction === true
    },
    {
      name: 'functionName',
      message: 'Function name',
      type: 'list',
      choices: () => loadFuncs(),
      when: (answers) => answers.createFunction === false
    }
  ])
  .then(generateEndpoint)
}
