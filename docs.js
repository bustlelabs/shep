const shep = require('./lib/index')
const { execSync } = require('child_process')


console.log(`### \`shep\``)
console.log('```')
console.log(execSync(`./cli.js --help`).toString().replace(/cli\.js/, 'shep').trim())
console.log('```')

for (var cmd in shep) {
  let help = execSync(`./cli.js ${cmd} --help`).toString().replace(/cli\.js/, 'shep').trim()
  console.log(`#### \`shep ${cmd}\``)
  console.log('```')
  console.log(help)
  console.log('```')
}
