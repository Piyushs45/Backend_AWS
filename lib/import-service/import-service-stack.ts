import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucket = new s3.Bucket(this, 'ImportBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Deploy placeholder file to create uploaded/ folder
    new s3deploy.BucketDeployment(this, 'DeployUploadedFolder', {
      sources: [s3deploy.Source.data('uploaded/.keep', '')],
      destinationBucket: bucket,
      destinationKeyPrefix: 'uploaded/',
    });

    // Import the SQS queue (created in another stack)
    const catalogItemsQueue = sqs.Queue.fromQueueArn(
      this,
      'ImportedCatalogQueue',
      'arn:aws:sqs:us-east-1:256443123887:catalogItemsQueue'
    );

    // Lambda to generate signed URL
    const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFile', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      handler: 'importProductsFile.handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Lambda to parse uploaded CSV and send to SQS
    const importFileParserLambda = new lambda.Function(this, 'ImportFileParser', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      handler: 'importFileParser.handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
        CATALOG_ITEMS_QUEUE_URL: catalogItemsQueue.queueUrl,
      },
    });

    // Grant permissions
    bucket.grantPut(importProductsFileLambda);
    bucket.grantRead(importFileParserLambda);
    catalogItemsQueue.grantSendMessages(importFileParserLambda); // ✅ Important fix

    // Add S3 → Lambda trigger
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      { prefix: 'uploaded/' }
    );

    // API Gateway setup
    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Products Service',
    });

    const importProductsResource = api.root.addResource('import');
    importProductsResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda));

    importProductsResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET'],
    });
  }
}
