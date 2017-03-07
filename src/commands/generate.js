export const command = 'generate'
export const desc = 'Run `shep generate --help` for additional information'
export function builder (yargs) {
  return yargs
  .commandDir('./generate')
  .demand(1)
  .strict()
}
