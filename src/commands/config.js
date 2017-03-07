export const command = 'config'
export const desc = 'Run `shep config --help` for additional information'
export function builder (yargs) {
  return yargs
  .commandDir('./config')
  .demand(1)
  .strict()
}
