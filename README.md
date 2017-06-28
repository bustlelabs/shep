[![Build Status](https://travis-ci.org/bustle/shep.svg?branch=master)](https://travis-ci.org/bustle/shep)
[![Code Climate](https://codeclimate.com/github/bustlelabs/shep/badges/gpa.svg)](https://codeclimate.com/github/bustlelabs/shep)

<div align="center">
<a href="https://github.com/bustlelabs/shep">
<img src="https://typeset-beta.imgix.net/2017/2/21/471fd5d2-edd8-4e65-bce4-e93e79015bbb.png?w=400" />
</a>
<div>A framework for building JavaScript APIs with AWS API Gateway and Lambda</div>
</div>


## Make "Serverless" Simple

Amazon Web Services [API gateway](https://aws.amazon.com/api-gateway/) and [Lambda](https://aws.amazon.com/lambda/) are great tools for building and deploying ["serverless"](http://cloudacademy.com/blog/aws-lambda-serverless-cloud/) applications. But using them to deploy more than a couple functions/endpoints involves an excessive amount of manual work such as zipping files, uploading via the web UI, configuring paths and function names, etc. Shep is built to automate as many of these tasks as possible, giving you the ability to deploy an entire API and suite of lambda functions with one CLI command.

## Getting Started With Shep

### Prerequisites

It will be helpful to have some existing experience with API gateway and Lambda. If you have never used either of these tools before, it is recommended to setup a function manually to see how things are done. Please refer to Amazon's own [getting started guide](http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html)

### AWS credentials

Shep will require your amazon credentials and will load them using the same methods as the AWS CLI tool meaning you must have setup the AWS CLI tool before using shep. Consult [Amazon's CLI documentation](http://docs.aws.amazon.com/cli/latest/topic/config-vars.html) for instructions.

### AWS S3 Build Artifacts

Shep stores build artifacts on S3 so it can skip the upload step when your functions don't change. By default, Lambda won't update the version of an alias unless the function has changed - so this will come into effect for deploys of config changes. This isn't enabled by default, to enable it add the name of the S3 bucket to the `"bucket"` field in the `shep` version of your `package.json`.

### Installation

```bash
npm install -g shep

```
```bash
// Optionally install shep in your project. The global shep will run the project's shep
npm install --save-dev shep
```

Add a few lines to your `package.json`. Your [account id](https://console.aws.amazon.com/billing/home?#/account) can be found on the billing page of your aws account.

```json
{
  "name": "my-great-package",
    "shep": {
      "accountId": "XXXXX",
      "region": "us-east-1"
    }
}
```

### Environments

Environments for a shep project are defined by the aliases on the functions associated with a project. Environments are created through `shep deploy --env new_env` and managed by using the `shep config` commands. Shep takes a strong stance against having different environments for different functions within a project. If you attempt a command which requires the listing of environments and there is a mismatch detected, then shep will throw a `EnvironmentMistmach` error until you remedy the issue. Most issues can be automatically fixed by using `shep config sync`, the only issues this can't solve are conflicting environment variable values. Conflicting value issues can be solved by using `shep config set my_env CONFLICT_VARIABLE=value`.

### Custom Builds Commands

By default shep builds all your functions using webpack. If your project requires a different build process, then edit your `package.json`. Before running your build command, shep populates the `PATTERN` environment variable which can be accessed as `process.env.PATTERN` in your build command. Be aware that using your own build process will break pattern matching for `shep build` unless your build command respects the `PATTERN` variable.

```json
{
  "shep": {
    "buildCommand": "custom-build --with-flag"
  }
}
```

### Creating a new API

##### 1. Configure AWS
   Since Shep uses the same credentials as the AWS CLI, all you need to do is configure the cli. This can be accomplished via `aws configure`.
##### 2. Create a new Shep project
   Run `shep new my-project`  
   This will create and configure a Shep project called 'my-project' in the `my-project` directory. Change into this directory.
##### 3. Create a new endpoint and function
   Run `shep generate endpoint /hello` and follow the prompts.  
   This creates a new endpoint as well as a new function for that endpoint. Specifically, it adds a path to `api.json` that is configured to trigger the newly created function.
##### 4. Deploy
   Run `shep deploy --env development`  
   This command does a couple things in order to deploy your project:  
  * Uses webpack to build your functions. This is equivalent to running `shep build`.
  * Creates or updates the Lambda functions associated with your project. This includes creating a new version of the function as well as updating the alias such that `development` will point to the version you just created. For more on versioning please consult Amazon's own [documentation](http://docs.aws.amazon.com/lambda/latest/dg/versioning-aliases.html).
  * Creates or updates the API Gateway associated with your project and deploys it to the specified stage, `development` in this case.  

   You can test your endpoint by visiting the API URL printed out after the project is deployed. Visiting the `/hello` endpoint which should show `success!`.

## CLI Documentation
CLI documentation can be found in [DOCS.md](DOCS.md)


## Upgrading

Read the [migration docs](migration.md) for information on upgrading major version changes

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
