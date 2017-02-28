import fs from 'fs-extra-promise'

export const mkdirp = fs.mkdirpAsync
export const readFile = fs.readFileAsync
export const writeFile = fs.writeFileAsync
export const writeJSON = fs.writeJSONAsync
export const readJSON = fs.readJSONAsync
export const readJSONSync = fs.readJSONSync
export const readdirSync = fs.readdirSync
export const readdir = fs.readdirAsync
