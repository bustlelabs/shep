import * as load from '../../util/load'

export default function () {
  const api = load.api()
  if (!api) { return [] }

  return !api.info.description ? [{ rule: 'missing-api-description', message: 'api.json has no info.description' }] : []
}
