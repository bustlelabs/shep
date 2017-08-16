describe('shep.build', () => {
  it('Executes custom command', async () => {
    const buildCommand = 'custom-build --cool-flag -x 6'
    const exec = async (command) => {
      assert.equal(command, buildCommand)
    }
    exec['@global'] = true
    const shep = proxyquire('../src/', {
      './load': {
        '@global': true,
        pkg: async () => { return { shep: { buildCommand } } }
      },
      './modules/exec': exec
    })

    await shep.build({ quiet: true })
  })

  it('Logs to console when no webpack found', async () => {
    const error = new Error()
    error.code = 'ENOENT'

    const exec = async (command) => {
      throw error
    }
    exec['@global'] = true

    const shep = proxyquire('../src/', {
      './load': {
        '@global': true,
        pkg: async () => { return { shep: { } } }
      },
      './modules/exec': exec
    })

    assert.deepEqual(await assert.isRejected(shep.build({ quiet: true })), error)
  })

  it('Executed webpack', async () => {
    const exec = async (command) => {
      assert.equal(command, 'webpack --bail')
    }
    exec['@global'] = true

    const shep = proxyquire('../src/', {
      './load': {
        '@global': true,
        pkg: async () => { return { shep: { } } }
      },
      './modules/exec': exec
    })
    await shep.build({ quiet: true })
  })
})
