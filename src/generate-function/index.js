import { mkdirp, writeFile } from '../util/modules/fs'
import genName from '../util/generate-name'
import * as templates from './templates'
import Promise from 'bluebird'

export default async function ({ name, logger = () => {} }) {
  const { shortName, fullName } = await genName(name)

  logger({ type: 'start', body: `Create functions/${shortName}/` })
  await mkdirp(`./functions/${shortName}`)

  logger({ type: 'start', body: `Create functions/${shortName}/events` })
  await mkdirp(`./functions/${shortName}/events`)

  logger({ type: 'start', body: 'Create files' })
  await createFiles(shortName)

  logger({ type: 'done' })
  return fullName

  function createFiles () {
    return Promise.all([
      writeFile(`./functions/${shortName}/index.js`, templates.index()),
      writeFile(`./functions/${shortName}/lambda.json`, templates.lambda(fullName)),
      writeFile(`./functions/${shortName}/events/default.json`, templates.event())
    ])
  }
}
