import execa from 'execa'
import Promise from 'bluebird'
export default Promise.method(execa.shell)
