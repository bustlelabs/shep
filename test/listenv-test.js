describe('shep.listEnv', () => {
  it('returns a list of environments', async () => {
    const exec = async (command) => {
      assert.equal(command, 'webpack --bail')
    }
    exec['@global'] = true

    const shep = proxyquire('../src/', {
      './load': {
        '@global': true,
        async pkg () { return { shep: {} } }
      },
      './modules/exec': exec,
      './modules/fs': {
        '@global': true,
        async readdir () { return ['function1', 'function2'] },
        async readJSON () { return {} }
      },
      './aws/lambda': {
        '@global': true,
        async isFunctionDeployed () { return true },
        async listAliases () {
          return [
            { Name: 'beta' },
            { Name: 'production' },
            { Name: 'staging' }
          ]
        }
      }
    })

    assert.deepEqual(await shep.loadEnvs(), [
      'beta',
      'production',
      'staging'
    ])
  })
})
