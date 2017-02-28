import * as load from '../../util/load'
import parseApi from '../../util/parse-api'
import generateName from '../../util/generate-name'

export default function () {
  const api = load.api()
  if (!api) { return [] }

  const funcNames = load.funcs('*')
  const integrations = parseApi(api)
  const unreferencedFunctions = funcNames.filter((funcName) => {
    return !integrations.some(({ uri }) => isFuncInUri(funcName, uri))
  })

  return unreferencedFunctions.map(generateWarning)
}

function isFuncInUri (funcName, uri) {
  if (uri === undefined) { return false }
  const funcRegExp = new RegExp(`:${generateName(funcName).fullName}:`)
  return funcRegExp.test(uri)
}

function generateWarning (funcName) {
  return {
    rule: 'unreferenced-functions',
    message: `${funcName} isn't referenced by api.json`
  }
}

