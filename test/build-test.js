describe('shep.build', () => {
  const exec = td.replace('../src/util/modules/exec')
  td.when(exec(), { ignoreExtraArgs: true }).thenResolve()

  it('Executes custom command', async () => {
    const buildCommand = 'custom-build --cool-flag -x 6'
    const load = td.replace('../src/util/load')
    td.when(load.pkg()).thenResolve({ shep: { buildCommand } })
    td.when(exec(), { ignoreExtraArgs: true }).thenResolve()
    const shep = require('../src')

    td.when(exec(buildCommand), { ignoreExtraArgs: true }).thenResolve()
    await shep.build({ quiet: true })
  })

  it('Logs to console when no webpack found', async () => {
    let error = new Error()
    error.code = 'ENOENT'

    const load = td.replace('../src/util/load')
    td.when(load.pkg()).thenResolve({ shep: {} })

    td.when(exec('webpack --bail'), { ignoreExtraArgs: true }).thenReject(error)
    td.replace(console, 'warn')

    const shep = require('../src')
    error = await assert.isRejected(shep.build({ quiet: true }))
    assert.equal(error.code, 'ENOENT')
    td.verify(console.warn(), { ignoreExtraArgs: true })
  })

  describe('Executed webpack', async () => {
    const load = td.replace('../src/util/load')
    const shep = require('../src')
    td.when(load.pkg()).thenResolve({})
    td.when(exec('webpack --bail'), { ignoreExtraArgs: true }).thenResolve()
    await shep.build({ quiet: true })
  })
})
