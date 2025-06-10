import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSEvent, Context } from 'aws-lambda';

const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const snsClient = new SNSClient({ region: 'us-east-1' });

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

if (!PRODUCTS_TABLE) {
  throw new Error('PRODUCTS_TABLE environment variable must be defined');
}
if (!SNS_TOPIC_ARN) {
  throw new Error('SNS_TOPIC_ARN environment variable must be defined');
}

export const handler = async (event: SQSEvent, context: Context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const putPromises = event.Records.map(async (record) => {
      const product = JSON.parse(record.body);
      console.log('Processing product:', product);

      const putCommand = new PutItemCommand({
        TableName: PRODUCTS_TABLE,
        Item: {
          id: { S: product.id },
          title: { S: product.title },
          description: { S: product.description },
          price: { N: product.price.toString() },
        },
      });

      await dynamoClient.send(putCommand);
    });

    await Promise.all(putPromises);

    await snsClient.send(
      new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Subject: 'New Products Created',
        Message: JSON.stringify({
          message: 'New products created',
          count: event.Records.length,
        }),
      })
    );

    console.log('Products processed and SNS notification sent.');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Products created successfully',
      }),
    };
  } catch (error) {
    console.error('Error processing products:', error);
    throw error;
  }
};
