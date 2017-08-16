import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import proxyquire from 'proxyquire'

chai.use(chaiAsPromised)
global.proxyquire = proxyquire.noPreserveCache()
