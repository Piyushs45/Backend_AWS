import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket with versioning and auto-delete on stack removal
    const bucket = new s3.Bucket(this, 'ImportBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      // optional: bucketName: 'import-service-demo-bucket', // Only if you want fixed global name
    });

    // Deploy empty file to create uploaded/ folder
    new s3deploy.BucketDeployment(this, 'DeployUploadedFolder', {
      sources: [s3deploy.Source.data('uploaded/.keep', '')],
      destinationBucket: bucket,
      destinationKeyPrefix: 'uploaded/',
    });

    // Lambda to generate signed URL for uploads
    const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFile', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // adjust path if needed
      handler: 'importProductsFile.handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Lambda to process files after upload
    const importFileParserLambda = new lambda.Function(this, 'ImportFileParser', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // adjust path if needed
      handler: 'importFileParser.handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Grant bucket permissions to Lambdas
    bucket.grantPut(importProductsFileLambda);
    bucket.grantRead(importFileParserLambda);

    // Add S3 event notification: on object created in uploaded/ trigger importFileParserLambda
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      { prefix: 'uploaded/' }
    );

    // Define API Gateway REST API
    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Products Service',
    });

    // Add /import GET endpoint integrated with importProductsFileLambda
    const importProductsResource = api.root.addResource('import');
    importProductsResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda));

    // Optionally, add CORS preflight if your frontend requires it:
    importProductsResource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['GET'],
    });
  }
}
