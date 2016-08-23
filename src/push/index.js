import { pushApi } from '../util/api-gateway'
import requireProject from '../util/require-project'
import { update } from '../util/shep-config'
import AWS from 'aws-sdk'

export default function(opts){
  AWS.config.update({region: opts.region})

  const api = requireProject(`api.json`)

  return pushApi(api, opts.apiId)
  .get('id')
  .tap((id) => update({ apiId: id, region: opts.region }) )
}
