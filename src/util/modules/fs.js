import fs from 'fs-extra-promise'

export const exists = fs.existsAsync
export const mkdirp = fs.mkdirpAsync
export const readdir = fs.readdirAsync
export const readdirSync = fs.readdirSync
export const readFile = fs.readFileAsync
export const readJSON = fs.readJSONAsync
export const readJSONSync = fs.readJSONSync
export const writeFile = fs.writeFileAsync
export const writeJSON = fs.writeJSONAsync
