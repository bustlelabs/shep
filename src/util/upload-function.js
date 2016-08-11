import Promise from 'bluebird'
import { clone } from 'lodash'
import lambda from '../util/lambda'
import zipDir from '../util/zip-dir'
import { update } from './tasks'
import loadLambdaConfig from '../util/load-lambda-config'

export default function(name){
  const lambdaConfig = loadLambdaConfig(name)

  update(name, 'Zipping files')

  return zipDir(`dist/${name}`)
  .tap(() => update(name, 'Uploading to AWS') )
  .then(upload)

  function upload(zip){
    return get()
    .then(update)
    .catch({ code: 'ResourceNotFoundException' }, create)

    function create() {
      var params = clone(lambdaConfig)

      params.Code = { ZipFile: zip }
      params.Publish = true

      return lambda.createFunction(params)
    }

    function get(){
      return lambda.getFunction({FunctionName: lambdaConfig.FunctionName})
      .catch((err)=> {
        if (err.code === 'ResourceNotFoundException'){
          return Promise.resolve()
        } else {
          return Promise.reject(err)
        }
      })
    }

    function update() {
      return updateCode().tap(updateConfig)
    }

    function updateCode() {
      var params = { ZipFile: zip, FunctionName: lambdaConfig.FunctionName, Publish: true }
      return lambda.updateFunctionCode(params)
    }

    function updateConfig() {
      var params = clone(lambdaConfig)
      params.FunctionName = lambdaConfig.FunctionName
      return lambda.updateFunctionConfiguration(params)
    }
  }
}
