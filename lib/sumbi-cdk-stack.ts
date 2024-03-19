import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class SumbiCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc( this, 'MyVpc');

    // Create RDS PostgreSQL instance
    const postgresInstance = new rds.DatabaseInstance(this, 'PostgresInstance', {
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      databaseName: 'mydb',
      publiclyAccessible: true,
    });

    // Create Lambda function
    const myFunction = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      code: lambda.Code.fromAsset('./lambda/'),
      environment: {
        DATABASE_URL: postgresInstance.instanceEndpoint.socketAddress,
      },
    });

    // Grant Lambda function access to RDS instance
    postgresInstance.grantConnect(myFunction);

     // Define the API Gateway REST API
    const api = new apigateway.RestApi(this, 'MyApi', {
      restApiName: 'MyService',
      description: 'This is my API Gateway',
    });

    const resource = api.root.addResource('myresource');
    resource.addMethod('GET'); // HTTP GET /myresource

  }
}
