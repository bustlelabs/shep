import ora from 'ora'
import chalk from 'chalk'

export default function () {
  const spinners = []

  const start = (body) => {
    const cur = spinners.pop()
    if (cur !== undefined) {
      cur.succeed()
    }
    spinners.push(ora({ text: body, color: 'gray' }).start())
  }

  const fail = (body) => {
    const cur = spinners.pop()
    if (cur !== undefined) {
      cur.fail()
    }
  }

  const done = (body) => {
    spinners.forEach((s) => {
      s.succeed()
    })
  }

  const skip = (body) => {
    const cur = spinners.pop()
    if (cur !== undefined) {
      cur.succeed()
    }
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
