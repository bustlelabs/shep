# Shep

A framework for building JavaScript APIs with AWS API Gateway and Lambda

[![Build Status](https://travis-ci.org/bustlelabs/shep.svg?branch=master)](https://travis-ci.org/bustlelabs/shep)
[![Code Climate](https://codeclimate.com/github/bustlelabs/shep/badges/gpa.svg)](https://codeclimate.com/github/bustlelabs/shep)

## Why do you need this?

Amazon Web Services [API gateway](https://aws.amazon.com/api-gateway/) and [Lambda](https://aws.amazon.com/lambda/) are great tools for building and deploying ["serverless"](http://cloudacademy.com/blog/aws-lambda-serverless-cloud/) applications. But using them to deploy more than a couple functions/endpoints involves an excessive amount of manual work such as zipping files, uploading via the web UI, configuring paths and function names, etc. Shep is built to automate as many of these tasks as possible, giving you the ability to deploy an entire API and suite of lambda functions with one CLI command.

## Getting Started

### Prerequisites

It will be helpful to have some existing experience with API gateway and Lambda. If you have never used either of these tools before, it is recommended to setup a function manually to see how things are done. Please refer to Amazon's own [getting started guide](http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html)  

### AWS credentials

Shep will require your amazon credentials and will load them using the same methods as the AWS CLI tool. Consult [Amazon's CLI documentation](http://docs.aws.amazon.com/cli/latest/topic/config-vars.html) for instructions.

### Installation

`npm install -g shep@beta`

### Creating a new API

_Coming soon!_

### Using an existing API Gateway project

_Coming soon!_


## CLI Documentation

### `shep`
```
Usage: shep <command> [options]

Commands:
  build [env] [functions..]   Builds functions and writes them to disk
  deploy [env] [functions..]  Deploy both functions and APIs to AWS. Will create a new API if the ID is not specified
  generate                    Run `shep generate --help` for additional information
  new [path]                  Create a new shep project
  pull                        Pulls a swagger JSON representation of an existing API and writes it to a local file
  push                        Create a new shep project
  run [name]                  Run a function in your local environemnt

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
```
#### `shep new`
```
shep new [path]

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
  --path     Location to create the new shep project

Examples:
  shep new         Launch an interactive CLI
  shep new my-api  Generates a project at `my-api`
```
#### `shep pull`
```
shep pull

Options:
  --version     Show version number                                                                            [boolean]
  --help        Show help                                                                                      [boolean]
  --region, -r  AWS region                                                                                    [required]
  --stage, -s   AWS API Gateway stage. Read from the shep config in project.json if not provided              [required]
  --api-id, -a  AWS API Gateway ID. Read from the shep config in project.json if not provided                 [required]
  --output, -o  Path of the file to output                                                         [default: "api.json"]

Examples:
  shep pull                           Download a JSON swagger file for `apiId` in package.json and prompts for stage via
                                      interactive CLI
  shep pull --api-id foo --stage bar  Downloads a JSON swagger file for stage `bar` of API id `foo`
  shep pull --output other-path.json  Writes the JSON swagger file to `other-path.json`
```
#### `shep push`
```
shep push

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
  --api-id   API Gateway resource id. Read from package.json if not provided                                  [required]
  --region   AWS region. Read from package.json if not provided                                               [required]

Examples:
  shep push                                  Pushes the api.json swagger configuration to API Gateway. Does not deploy
                                             the API.
  shep push --api-id foo --region us-east-1
```
#### `shep run`
```
shep run [name]

Options:
  --version      Show version number                                                                           [boolean]
  --help         Show help                                                                                     [boolean]
  --environment  Environment variables to use                                                   [default: "development"]
  --event        Event to use

Examples:
  shep run                               Launch an interactive CLI
  shep run foo                           Runs the `foo` function for all events
  shep run foo --event default           Runs the `foo` function for just the `default` event
  shep run foo --environment production  Runs the `foo` function with production environment
```
#### `shep deploy`
```
shep deploy [env] [functions..]

Options:
  --version          Show version number                                                                       [boolean]
  --help             Show help                                                                                 [boolean]
  --api-id           The API Gateway API id. Read from package.json if not provided.                          [required]
  --concurrency, -c  Number of functions to build and upload at one time                             [default: Infinity]

Examples:
  shep deploy production              Deploy all functions with production env variables
  shep deploy production create-user  Deploy only the create-user function
  shep deploy production *-user       Deploy only functions matching the pattern *-user
```
#### `shep build`
```
shep build [env] [functions..]

Options:
  --version          Show version number                                                                       [boolean]
  --help             Show help                                                                                 [boolean]
  --concurrency, -c  The number of functions to build at one time                                    [default: Infinity]

Examples:
  shep build                   Launch an interactive CLI
  shep build beta              Build all functions with beta environment variables
  shep build beta create-user  Build only the create-user function
  shep build beta *-user       Build functions matching the pattern *-user
```

## Why the name 'shep'?

It was called 'shepherd' at first because it was helpful for dealing with *lamb*da but everyone kept shortening it to 'shep' so we changed the name

## Other Tools

[Serverless](https://github.com/serverless/serverless)
[Apex](https://github.com/apex/apex)
[Gordon](https://github.com/jorgebastida/gordon)
[DEEP](https://github.com/MitocGroup/deep-framework)
[Claudia.js](https://github.com/claudiajs/claudia)

## Development

Pull requests welcome!

Test: `npm test`

Rebuild on file change: `npm run compile -- -w`
