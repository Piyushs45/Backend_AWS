import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as path from 'path';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Step 1: Create S3 Bucket
    const importBucket = new s3.Bucket(this, 'ImportBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only
    });

    // Step 2: Define the importProductsFile Lambda function
    const importProductsFile = new lambda.Function(this, 'ImportProductsFile', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'importProductsFile.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        BUCKET_NAME: importBucket.bucketName,
      },
    });

    importBucket.grantPut(importProductsFile);

    // Step 3: Define API Gateway with CORS handled manually like ProductService
    const api = new apiGateway.RestApi(this, 'ImportApi', {
      restApiName: 'ImportServiceAPI',
      description: 'This service handles file imports and parsing.',
    });

    const importResource = api.root.addResource('import');

    importResource.addMethod('GET', new apiGateway.LambdaIntegration(importProductsFile, {
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'*'",
          },
        },
      ],
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    });

    // Also add CORS preflight for GET (like in ProductServiceStack)
    importResource.addCorsPreflight({
      allowOrigins: apiGateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET'],
    });

    // Step 4: Define the importFileParser Lambda
    const importFileParser = new lambda.Function(this, 'ImportFileParser', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'importFileParser.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        BUCKET_NAME: importBucket.bucketName,
      },
    });

    importBucket.grantRead(importFileParser);

    importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.LambdaDestination(importFileParser),
      { prefix: 'uploaded/' }
    );

    // Step 5: Grant permissions
    importProductsFile.addToRolePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject'],
      resources: [`${importBucket.bucketArn}/*`],
    }));

    importFileParser.addToRolePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:CopyObject', 's3:DeleteObject'],
      resources: [`${importBucket.bucketArn}/*`],
    }));
  }
}
