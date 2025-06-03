import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const snsClient = new SNSClient({ region: 'us-east-1' });

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

export const handler = async (event: any) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const putPromises = event.Records.map(async (record: any) => {
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
      Message: JSON.stringify({ message: 'New products created', count: event.Records.length }),
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Products created successfully' }),
  };
};
