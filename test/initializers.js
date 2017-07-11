import td from 'testdouble'
import Promise from 'bluebird'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

td.config({ promiseConstructor: Promise, ignoreWarnings: true })
global.td = td
