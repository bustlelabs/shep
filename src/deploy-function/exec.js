const Promise = require('bluebird')
const { clone, assign } = require('lodash')
const lambda = require('../util/lambda')
const fs = require('../util/fs')
const path = require('path')
const { tmpdir } = require('os')
const exec  = require('../util/exec')
const babel = require('babel-core')
const glob = require('../util/glob')
const observatory = require('observatory')
const archiver = require('archiver')
const streamBuffers = require('stream-buffers')

const tmpDir = tmpdir()

const crufRegex = /^\/dist|\/(appveyor.yml|\.appveyor.yml|\.github|appdmg|AUTHORS|CONTRIBUTORS|bench|benchmark|benchmark\.js|bin|bower\.json|component\.json|coverage|doc|docs|docs\.mli|dragdrop\.min\.js|example|examples|example\.html|example\.js|externs|ipaddr\.min\.js|Makefile|min|minimist|perf|rusha|simplepeer\.min\.js|simplewebsocket\.min\.js|static\/screenshot\.png|test|tests|test\.js|tests\.js|\.[^\/]*|.*\.md|.*\.markdown)$/

module.exports = function(opts, api, pkg){
  const funcDir = `functions/${opts.name}`
  const funcPackage = fs.readJsonSync(`${funcDir}/package.json`)
  const lambdaConfig = fs.readJsonSync(`${funcDir}/lambda.json`)
  const tmpFuncDir = path.join(tmpDir, opts.name)
  const tmpFuncZipFile = opts.output || path.join(tmpDir, `${opts.name}.zip`)
  const remoteFuncName = opts.functionNamespace ? `${opts.functionNamespace}-${opts.name}` : opts.name
  let task
  if (opts.silent !== true) { task = observatory.add(`Deploying ${remoteFuncName}`)}

  return Promise.all([fs.removeAsync(tmpFuncDir), fs.removeAsync(tmpFuncZipFile)])
  .then(copyFunc)
  .then(transpile)
  .then(writeEnvVars)
  .then(inheritDeps)
  .then(installDeps)
  .then(cleanCruft)
  .then(zipDir)
  .then(upload)

  function copyFunc(){
    if (task) { task.status('Copying Files') }
    return fs.copyAsync(funcDir, tmpFuncDir, { dereference: true, filter: (path) => path.indexOf(`${opts.name}/node_modules`) < 0 })
  }

  function transpile(){
    if (task) { task.status('Transpiling ES2015') }
    return glob(`${tmpFuncDir}/**/*.js`).map((path)=>{
      return fs.readFileAsync(path, 'utf8')
      .then((file) => babel.transform(file, pkg.babel).code )
      .then((code) => fs.writeFileAsync(path, code))
    })
  }

  function writeEnvVars(){
    if (opts.env){
      if (task) { task.status('Writing env variables') }
      const handler = `${tmpFuncDir}/${lambdaConfig.Handler}`
      const handlerFileName = handler.substring(0, handler.lastIndexOf('.')) + '.js'
      return Promise.join(
        fs.readFileAsync(handlerFileName, 'utf8'),
        readEnvFile(),
        (handlerFile, envHeader) => {
          let arr = handlerFile.split('\n')
          arr.splice(1,0,envHeader)
          return arr.join('\n')
        }
      )
      .then((file)=>{
        return fs.writeFileAsync(handlerFileName, file)
      })
    } else {
      return Promise.resolve()
    }
  }

  function readEnvFile(){
    return fs.readJSONAsync(`config/${opts.env}.json`)
    .then((env) => `global.env = ${JSON.stringify(env, null, 2)}` )
  }

  function inheritDeps(){
    funcPackage.dependencies = assign({}, pkg.dependencies, funcPackage.dependencies)
    return fs.writeJSONAsync(path.join(tmpFuncDir, 'package.json'), funcPackage)
  }

  function cleanCruft(){
    if (task) { task.status('Removing cruft') }
    return glob(`${tmpFuncDir}/node_modules/**`)
    .filter((file) => file.match(crufRegex) )
    .map(file => fs.unlinkAsync(file).catch(()=>{}) )
  }

  function installDeps(){
    if (task) { task.status('Installing dependencies') }
    return exec('npm install --silent --production', { cwd: tmpFuncDir })
  }

  function zipDir(){
    return new Promise((resolve, reject)=>{
      if (task) { task.status('Zipping function') }
      const archive = archiver.create('zip')
      let output
      if (opts.output){
        output = fs.createWriteStream(tmpFuncZipFile)
      } else {
        output = new streamBuffers.WritableStreamBuffer()
      }

      output.on('finish', function() { resolve(output) })
      archive.on('error', function(err) { reject(err) })
      archive.pipe(output)
      archive.directory(tmpFuncDir, './').finalize()
    })
  }

  function upload(stream){
    if (opts.output){
      task.done(`Zip written to ${tmpFuncZipFile}`)
      return Promise.resolve()
    } else {
      if (task) { task.status('Uploading to AWS') }
      return Promise.join(
        stream.getContents(),
        get(),
        (zipFile, remoteFunc)=> {
          if (remoteFunc){
            return Promise.all([updateCode(zipFile), updateConfig()]).get(0)
          } else {
            return create(zipFile)
          }
        }
      ).tap(() => { if (task) { task.done('Complete!') }})
    }

    function create(ZipFile) {
      var params = clone(lambdaConfig)

      params.Code = { ZipFile }
      params.FunctionName = remoteFuncName

      return lambda.createFunction(params)
    }

    function get(){
      return lambda.getFunction({FunctionName: remoteFuncName})
      .catch((err)=> {
        if (err.code === 'ResourceNotFoundException'){
          return Promise.resolve()
        } else {
          return Promise.reject(err)
        }
      })
    }

    function updateCode(ZipFile) {
      var params = { ZipFile, FunctionName: remoteFuncName }
      return lambda.updateFunctionCode(params)
    }

    function updateConfig() {
      var params = clone(lambdaConfig)
      params.FunctionName = remoteFuncName
      return lambda.updateFunctionConfiguration(params)
    }
  }
}
