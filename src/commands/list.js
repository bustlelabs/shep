import Table from 'cli-table'
import list from '../list'

export const command = 'list'
export const desc = 'Lists endpoints'
// export function builder (yargs) {
//   return yargs
//   .describe('quiet', 'Don\'t log anything')
//   .default('quiet', false)
// }

export async function handler (opts) {
  const endpoints = await list(opts)
  const table = new Table({
    head: ['Path', 'Method', 'Lambda Function', 'Region']
  })
  endpoints.map(endpoint => {
    table.push([endpoint.path, endpoint.method, endpoint.handler, endpoint.region])
  })
  console.log(table.toString())
}
