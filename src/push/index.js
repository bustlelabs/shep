import push from '../util/push-api'
import * as load from '../util/load'

export default async function ({ apiId, region }) {
  const api = await load.api()
  return push(api, apiId, region)
}
