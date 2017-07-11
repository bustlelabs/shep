function constructCommand (command, flags) {
  return Object.keys(flags)
  .map((flag) => {
    return `--${flag} ${flags[flag]}`
  })
  .reduce((str, flag) => {
    return `${str} ${flag}`
  }, command)
}

function runCommand (t, command, parser) {
  parser.parse(command, (err, argv, output) => {
    err ? t.fail(`Error during yargs validation: ${err}`) : t.pass()
  })
}

function allFlags (t, command, parser, flags) {
  runCommand(t, constructCommand(command, flags), parser)
}
allFlags.title = (providedTitle, command) => `No errors when all flags passed to ${command}`

function noFlags (t, command, parser, flags) {
  runCommand(t, command, parser)
}
noFlags.title = (providedTitle, command) => `No errors when no flags passed to ${command}`

export { allFlags, noFlags }
