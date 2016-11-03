import AWS from './'
import { lambdaRole } from '../../new/templates'

export function createRole (name) {
  const iam = new AWS.IAM()
  const params = {
    RoleName: name,
    AssumeRolePolicyDocument: lambdaRole()
  }

  return iam.createRole(params).promise().get('Role').get('Arn')
}

export function getRole (name) {
  const iam = new AWS.IAM()
  const params = { RoleName: name }

  return iam.getRole(params).promise().get('Role').get('Arn')
}

export function attachPolicy (name) {
  const iam = new AWS.IAM()
  const params = {
    PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    RoleName: name
  }

  return iam.attachRolePolicy(params).promise()
}
