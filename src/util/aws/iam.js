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
