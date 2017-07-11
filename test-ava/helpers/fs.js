import td from './testdouble'

const fs = td.replace('../../src/util/modules/fs')

td.when(fs.mkdirp(), { ignoreExtraArgs: true }).thenResolve()
function createdDir (t, dirName) {
  td.verify(fs.mkdirp(td.matchers.contains(dirName)))
}
createdDir.title = (providedTitle, dirName) => `Created dir ${dirName}`

td.when(fs.writeFile(), { ignoreExtraArgs: true }).thenResolve()
function wroteFile (t, fileName) {
  td.verify(fs.writeFile(td.matchers.contains(fileName), td.matchers.isA(String)))
}
wroteFile.title = (providedTitle, fileName) => `Created file ${fileName}`

export { fs, wroteFile, createdDir }
