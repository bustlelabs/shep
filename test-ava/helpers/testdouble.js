import td from 'testdouble'
import Promise from 'bluebird'

td.config({ promiseConstructor: Promise, ignoreWarnings: true })

export default td
