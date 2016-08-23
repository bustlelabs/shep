import observatory from 'observatory'
import chalk from 'chalk'

let tasks = {}

export function queue(name){
  if (tasks[name]){
    return tasks[name]
  } else {
    tasks[name] = observatory.add(name).status(chalk.grey('Queued'))
    return tasks[name]
  }
}


export function done(name){
  if (tasks[name]){
    tasks[name].done()
  } else {
    throw new Error(`No task named ${name} has been started`)
  }
}

export function update(name, text){
  if (tasks[name]){
    tasks[name].status(text)
  } else {
    throw new Error(`No task named ${name} has been started`)
  }
}

export function details(name, text){
  if (tasks[name]){
    tasks[name].details(text)
  } else {
    throw new Error(`No task named ${name} has been started`)
  }
}
