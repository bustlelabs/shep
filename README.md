# Shep

A tool for building and deploying applications with Amazon API Gateway and Lambda.

[![Build Status](https://travis-ci.org/bustlelabs/shep.svg?branch=master)](https://travis-ci.org/bustlelabs/shep) [![npm version](https://badge.fury.io/js/shep.svg)](https://badge.fury.io/js/shep)
[![Code Climate](https://codeclimate.com/github/bustlelabs/shep/badges/gpa.svg)](https://codeclimate.com/github/bustlelabs/shep)

## Why?

Amazon Web Services [API gateway](https://aws.amazon.com/api-gateway/) and [Lambda](https://aws.amazon.com/lambda/) are great tools for building and deploying ["serverless"](http://cloudacademy.com/blog/aws-lambda-serverless-cloud/) applications. But using them to deploy more than a couple endpoints involves an excessive amount of manual work such as zipping files, uploading via the web UI, configuring paths and function names, etc. Shep is built to automate as many of these tasks as possible, giving you the ability to deploy an entire API and suite of lambda functions with one CLI command.

## Getting Started

### Prerequisites

It will be helpful to have some existing experience with API gateway and Lambda. If you have never used either of these tools before, it is recommended to setup a function manually to see how things are done. Please refer to Amazon's own [getting started guide](http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html)  

### AWS credentials

Shep will require your amazon credentials and will load them using the same methods as the AWS CLI tool. Consult [Amazon's CLI documentation](http://docs.aws.amazon.com/cli/latest/topic/config-vars.html) for instructions.

### Installation

`npm install -g shep`

### Quick Start

Shep uses a prompt based interface. The simplest API with one function and one endpoint can be created by running the following commands and answering the prompts:

```
> shep new
... follow prompts ...
> cd <project-folder>
> shep create-function
... follow prompts ...
> shep create-resource
... follow prompts ...
> shep create-method
... follow prompts ...
> shep deploy
... follow prompts ...
```

## CLI Documentation

`shep new` - Creates a new project. Will create a new API on AWS

`shep create-resource` - Creates a new resource

`shep create-function` - Creates a new function. Will create a new function on AWS

`shep create-method` - Creates a new method. You should already have created the resource and the function before running this command.

`shep deploy` - Deploys all functions, sets up permissions+versions, and creates a new API gateway deployment

`shep pull` - Pulls a JSON representation of your API and writes it to `api.json`. This is used by shep to match up functions with resources and endpoints. If you make changes using the API gateway web UI make sure to pull down those changes by running this command

`shep run` - Will run a function using the `development` environment and the event found at `functions/{funcName}/event.json`

## Using Without API Gateway

You can use `shep` without API gateway if you just need to deploy and version lambda functions. When creating a project use the following command: `shep new --no-api`. Your project will now skip any API gateway commands and integrations.

## Other Tools

[Serverless](https://github.com/serverless/serverless)

Shep and Serverless have similar goals. The creation of Shep was definitely inspired by Serverless. With Shep we strive for a more minimal feature set with more opinions baked in. We encourage you to check out both and select the right one for your project.

[Apex](https://github.com/apex/apex)

Apex is very similar to using Shep with the `--no-api` flag. It is just for managing and deploying lambda functions. It also supports multiple lambda runtimes where Shep only supports nodejs.

## Development

Pull requests welcome!

Test: `npm test`

Rebuild on file change: `npm run compile -- -w`
