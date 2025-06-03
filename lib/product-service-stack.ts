import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as eventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam'; // <== Make sure this is imported

export class ProductServiceStackTask extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'products');

    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      queueName: 'catalogItemsQueue'
    });

    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      topicName: 'createProductTopic'
    });

    createProductTopic.addSubscription(
      new subscriptions.EmailSubscription('sandhanpiyush20@gmail.com')
    );

    const catalogBatchProcess = new lambda.Function(this, 'CatalogBatchProcess', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'catalogBatchProcess.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        SNS_TOPIC_ARN: createProductTopic.topicArn,
        CATALOG_ITEMS_QUEUE_URL: catalogItemsQueue.queueUrl
      }
    });

    // Permissions for DynamoDB and SNS
    productsTable.grantWriteData(catalogBatchProcess);
    createProductTopic.grantPublish(catalogBatchProcess);
    catalogItemsQueue.grantSendMessages(catalogBatchProcess);

    // 🔐 Additional IAM permissions for SQS
    catalogBatchProcess.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'sqs:SendMessage',
          'sqs:ReceiveMessage',
          'sqs:GetQueueUrl',
          'sqs:GetQueueAttributes'
        ],
        resources: [catalogItemsQueue.queueArn]
      })
    );

    // Connect SQS event source
    catalogBatchProcess.addEventSource(
      new eventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5
      })
    );
  }
}
