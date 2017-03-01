import * as load from '../../util/load'

export default function () {
  const api = load.api()
  if (!api || api.info.description) { return [] }

  return [{
    rule: 'missing-api-description',
    message: 'api.json has no description in the info object'
  }]
}
