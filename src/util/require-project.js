import path from 'path'

export default function (relativePath) {
  return require(projectPath(relativePath))
}

function projectPath (relativePath) {
  return path.join(process.cwd(), relativePath)
}
