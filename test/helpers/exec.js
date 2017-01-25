import td from 'testdouble'

const exec = td.replace('../../src/util/modules/exec')

function didExec (t, cmd, options = {}) {
  td.verify(exec(cmd, td.matchers.contains(options)))
}

didExec.title = (providedTitle, cmd, subcmd) => `Executed ${cmd} ${subcmd || ''}`

export { exec, didExec }
