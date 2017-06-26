import { writeFile } from '../util/modules/fs'
import { exportStage } from '../util/aws/api-gateway'
import { update } from '../util/pkg-config'
import AWS from 'aws-sdk'

export default async function ({ apiId, stage, region, output = 'api.json', logger = () => {} }) {
  AWS.config.update({ region })

  try {
    logger({ type: 'start', body: `Export API currenly on ${stage}` })
    const exportedApi = await exportStage(apiId, stage)
    await update({ apiId, region })

    logger({ type: 'start', body: `Write to ${output}` })
    await writeFile(output, exportedApi, { spaces: 2 })

    logger({ type: 'done' })
    return exportedApi
  } catch (e) {
    logger({ type: 'fail', body: e })
    throw e
  }
}
