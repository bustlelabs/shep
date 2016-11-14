import td from 'testdouble'

const exec = td.replace('../../src/util/modules/exec')

function didExec (t, cmd, args, options = {}) {
  td.verify(exec(cmd, args, td.matchers.contains(options)))
}

didExec.title = (providedTitle, cmd, subcmd) => `Executed ${cmd} ${subcmd || ''}`

export { exec, didExec }
