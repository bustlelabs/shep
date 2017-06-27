import ora from 'ora'
import chalk from 'chalk'

export default function () {
  let cur

  const done = (body) => {
    if (cur !== undefined) {
      cur.succeed()
      cur = undefined
    }
  }

  const start = (body) => {
    done()
    cur = ora({ text: body, color: 'gray' }).start()
  }

  const fail = (body) => {
    if (cur !== undefined) {
      cur.fail(body)
    }
    cur = undefined
  }

  const skip = (body) => {
    done()
    ora(body).stopAndPersist({ text: body, symbol: chalk.yellow('→') })
  }

  return (message) => {
    if (message.type === 'start') {
      start(message.body)
    } else if (message.type === 'fail') {
      fail(message.body)
    } else if (message.type === 'done') {
      done()
    } else if (message.type === 'skip') {
      skip(message.body)
    } else {
      console.log(message)
    }
  }
}
