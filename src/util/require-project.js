import path from 'path'
import requireUncached from 'require-uncached'

export default function (relativePath) {
  return requireUncached(projectPath(relativePath))
}

function projectPath (relativePath) {
  return path.join(process.cwd(), relativePath)
}
