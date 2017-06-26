### `shep`
```
Usage: shep <command> [options]

Commands:
  build          Builds functions and writes them to disk
  config         Run `shep config --help` for additional information
  deploy         Deploy both functions and APIs to AWS. Will create a new API if the ID is not specified
  doctor         Checks your projects against best standards
  generate       Run `shep generate --help` for additional information
  logs [name]    Streams logs from the specified version of a function
  new [path]     Create a new shep project
  pull           Pulls a swagger JSON representation of an existing API and writes it to a local file
  push           Create a new shep project
  run [pattern]  Run a function in your local environemnt

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
```
#### `shep build`
```
shep build

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  -q, --quiet  Don't log anything                                                                       [default: false]

Examples:
  shep build                          Builds functions
  shep build --functions create-user  Build only the create-user function
  shep build --functions '*-user'     Build functions matching the pattern *-user
```
#### `shep config`
```
shep config

Commands:
  list              List environment variables on AWS for an alias
  remove <vars...>  Remove environment variables for alias on AWS
  set <vars...>     Set environment variables for alias on AWS
  sync              Syncs environments across all functions on a shep project

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
```
#### `shep config`
```
shep config

Commands:
  list              List environment variables on AWS for an alias
  remove <vars...>  Remove environment variables for alias on AWS
  set <vars...>     Set environment variables for alias on AWS
  sync              Syncs environments across all functions on a shep project

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
```
#### `shep config list`
```
shep config list

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  --quiet, -q  Don't log anything                                                                              [boolean]
  --env        Specifies which environment. If not provided an interactive menu will display the options
  --json       Formats output as JSON                                                                          [boolean]

Examples:
  shep config list --env beta  Print to console all environment variables of environment `beta` in JSON format
```
#### `shep config remove`
```
shep config remove <vars...>

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  --quiet, -q  Don't log anything                                                                              [boolean]
  --env        Specifies which environment to remove variables from. If not provided an interactive menu will display
               the options

Examples:
  shep config remove --env beta NEW_VARIABLE  Removes NEW_VARIABLE from all functions with beta alias
```
#### `shep config set`
```
shep config set <vars...>

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  --quiet, -q  Don't log anything                                                                              [boolean]

Examples:
  shep config set --env beta FOO=bar  Set environment variable FOO with value BAR for alias beta
```
#### `shep config sync`
```
shep config sync

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  --quiet, -q  Don't log anything                                                                              [boolean]
  -e, --env    Environment to sync

Examples:
  shep config sync             Syncs all environments
  shep config sync --env beta  Syncs `beta` environment
```
#### `shep deploy`
```
shep deploy

Options:
  --version    Show version number                                                                             [boolean]
  --help       Show help                                                                                       [boolean]
  --build      Build functions before deployment. Use --no-build to skip this step                       [default: true]
  --functions  Functions you wish to build and deploy
  -q, --quiet  Don't log anything                                                                       [default: false]
  -e, --env    Environment you want to deploy to, if it doesn't exist it will be created

Examples:
  shep deploy                                           Launch an interactive CLI
  shep deploy --env production                          Deploy all functions with production env variables
  shep deploy --env beta --no-build                     Deploy all functions as currently built in the dist folder
  shep deploy --env production --functions create-user  Deploy only the create-user function
  shep deploy --env beta --functions '*-user'           Deploy only functions matching the pattern *-user
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
#### `shep generate`
```
shep generate

Commands:
  endpoint [path]  Generate a new API endpoint
  function [name]  Generate a new function
  webpack          Generates a webpack.config.js with default template

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
```
#### `shep generate`
```
shep generate

Commands:
  endpoint [path]  Generate a new API endpoint
  function [name]  Generate a new function
  webpack          Generates a webpack.config.js with default template

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
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
#### `shep generate webpack`
```
shep generate webpack

Options:
  --version     Show version number                                                                            [boolean]
  --help        Show help                                                                                      [boolean]
  --quiet, -q   Don't log anything                                                                             [boolean]
  --output, -o  Output file                                                               [default: "webpack.config.js"]

Examples:
  shep generate webpack -o foo.js  Writes default webpack configuration to foo.js
```
#### `shep logs`
```
shep logs [name]

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
  --env      Specifies which environment to use. If not provided an interactive menu will display the options.
  --name     Name of function to use
  --time     Time in seconds that logs should be streamed                                            [default: Infinity]

Examples:
  shep logs                       Launch an interactive CLI
  shep logs --env production foo  Shows logs for the `foo` function in the production environment
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
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]
  --event    Event to use
  -t         Truncate responses
  --build    Build functions before running. If omitted functions are transpiled by babel on the fly    [default: false]

Examples:
  shep run                      Launch an interactive CLI
  shep run foo                  Runs the `foo` function for all events
  shep run foo --build          Builds the `foo` function and then runs it
  shep run foo --event default  Runs the `foo` function for just the `default` event
  DB_TABLE=custom shep run foo  Runs the `foo` function with process.env.DB_TABLE assigned to custom (vars declared this
                                way will overwrite vals in your .env file)
  shep run '*'                  Runs all functions for all events
  shep run 'foo-*'              Runs all functions matching pattern `foo-*`
```
