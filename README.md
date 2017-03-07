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

```bash
npm install -g shep
npm install --save-dev shep // the global shep will run the local shep
```

Add a few lines to your `package.json`. Your [account id](https://console.aws.amazon.com/billing/home?#/account),

```json
{
  "name": "my-great-package",
  "shep": {
    "accountId": "XXXXX",
    "region": "us-east-1"
  }
}
```

### Custom Builds

By default shep builds all your functions using webpack. If your project requires a different build process, then edit your `package.json`. Before running your build command, shep populates the `PATTERN` environment variable which can be accessed as `process.env.PATTERN` in your build command. Be aware that using your own build process will break pattern matching for `shep build` unless your build command respects the `PATTERN` variable. 

```json
{
  "shep": {
    "buildCommand": "custom-build --with-flag"
  }
}
```

### Creating a new API

_Coming soon!_

### Using an existing API Gateway project

_Coming soon!_


## CLI Documentation

### `shep`
```
Usage: shep <command> [options]

Commands:
  build [env] [functions]   Builds functions and writes them to disk
  deploy [env] [functions]  Deploy both functions and APIs to AWS. Will create a new API if the ID is not specified
  doctor                    Checks your projects against best standards
  generate                  Run `shep generate --help` for additional information
  lint                      Checks your projects against best standards
  logs [stage] [name]       Streams logs from the specified version of a function
  new [path]                Create a new shep project
  pull                      Pulls a swagger JSON representation of an existing API and writes it to a local file
  push                      Create a new shep project
  run [pattern]             Run a function in your local environemnt

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
```
#### `shep new`
```
shep new [path]

Options:
  --version      Show version number                                                                           [boolean]
  --help         Show help                                                                                     [boolean]
  --path         Location to create the new shep project
  --skip-config  Skips configuring shep project                                                                [boolean]
  --region       Region for new shep project
  --rolename     Name of IAM Role which will be used to execute Lambda functions
  -q, --quiet    Don't log anything                                                                     [default: false]

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
  --stage, -s   AWS API Gateway stage. Read from the shep config in package.json if not provided              [required]
  --api-id, -a  AWS API Gateway ID. Read from the shep config in package.json if not provided                 [required]
  --output, -o  Path of the file to output                                                         [default: "api.json"]
  -q, --quiet   Don't log anything                                                                      [default: false]
  --build                                                                                                [default: true]

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
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  --api-id     API Gateway resource id. Read from package.json if not provided                                [required]
  --region     AWS region. Read from package.json if not provided                                             [required]
  -q, --quiet  Don't log anything                                                                       [default: false]

Examples:
  shep push                                  Pushes the api.json swagger configuration to API Gateway. Does not deploy
                                             the API.
  shep push --api-id foo --region us-east-1
```
#### `shep run`
```
shep run [pattern]

Options:
  --version      Show version number                                                                           [boolean]
  --help         Show help                                                                                     [boolean]
  --environment  Environment variables to use                                                   [default: "development"]
  --event        Event to use
  -v             Responses from functions aren't truncated
  --build        Build functions before running. If omitted functions are transpiled by babel on the fly[default: false]

Examples:
  shep run                               Launch an interactive CLI
  shep run foo                           Runs the `foo` function for all events
  shep run foo --build                   Builds the `foo` function and then runs it
  shep run foo --event default           Runs the `foo` function for just the `default` event
  shep run foo --environment production  Runs the `foo` function with production environment
  DB_TABLE=custom shep run foo           Runs the `foo` function with process.env.DB_TABLE assigned to custom (vars
                                         declared this way will overwrite vals in your environments/env.json file)
  shep run '*'                           Runs all functions for all events
  shep run 'foo-*'                       Runs all functions matching pattern `foo-*`
```
#### `shep deploy`
```
shep deploy [env] [functions]

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  --build      Build functions before deployment. Use --no-build to skip this step                       [default: true]
  -q, --quiet  Don't log anything                                                                       [default: false]

Examples:
  shep deploy                         Launch an interactive CLI
  shep deploy production              Deploy all functions with production env variables
  shep deploy beta --no-build         Deploy all functions as currently built in the dist folder
  shep deploy production create-user  Deploy only the create-user function
  shep deploy beta *-user             Deploy only functions matching the pattern *-user
```
#### `shep build`
```
shep build [env] [functions]

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  -q, --quiet  Don't log anything                                                                       [default: false]

Examples:
  shep build                   Launch an interactive CLI
  shep build beta              Build all functions with beta environment variables
  shep build beta create-user  Build only the create-user function
  shep build beta *-user       Build functions matching the pattern *-user
```
#### `shep logs`
```
shep logs [stage] [name]

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
  --stage    Name of stage to use
  --name     Name of function to use
  --region   Name of region to use, uses region in `package.json` if not given
  --stream                                                                                     [boolean] [default: true]

Examples:
  shep logs                 Launch an interactive CLI
  shep logs production foo  Shows logs for the `foo` function in the production environment
```
#### `shep doctor`
```
shep doctor

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  --verbose    Logs additional information
  -q, --quiet  Don't log anything                                                                       [default: false]

Examples:
  shep doctor  Runs the doctor on your project
```
#### `shep generate function`
```
shep generate function [name]

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  --name       Function name
  -q, --quiet  Don't log anything                                                                       [default: false]

Examples:
  shep generate function      Launch an interactive CLI
  shep generate function foo  Genereate a new functon called "foo"
```
#### `shep generate endpoint`
```
shep generate endpoint [path]

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  --method     HTTP Method                                   [choices: "get", "post", "put", "delete", "options", "any"]
  -q, --quiet  Don't log anything                                                                       [default: false]
```
#### `shep generate webpack`
```
shep generate webpack

Options:
  --version     Show version number                                                                            [boolean]
  --help        Show help                                                                                      [boolean]
  --output, -o  Output file                                                               [default: "webpack.config.js"]

Examples:
  shep generate webpack -o foo.js  Writes default webpack configuration to foo.js
```
#### `shep version`
```
Usage: shep <command> [options]

Commands:
  build [env] [functions]   Builds functions and writes them to disk
  deploy [env] [functions]  Deploy both functions and APIs to AWS. Will create a new API if the ID is not specified
  doctor                    Checks your projects against best standards
  generate                  Run `shep generate --help` for additional information
  lint                      Checks your projects against best standards
  logs [stage] [name]       Streams logs from the specified version of a function
  new [path]                Create a new shep project
  pull                      Pulls a swagger JSON representation of an existing API and writes it to a local file
  push                      Create a new shep project
  run [pattern]             Run a function in your local environemnt

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
```

## Lambda Execution Role

More details to come, but check out the AWS docs about setting up the proper IAM role for lambda: http://docs.aws.amazon.com/lambda/latest/dg/intro-permission-model.html http://docs.aws.amazon.com/lambda/latest/dg/with-s3-example-create-iam-role.html

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

Publish: `npm run pub` "publish" is reserved by npm
