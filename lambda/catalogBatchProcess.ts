import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: "us-east-1"});

export const handler = async (event: any) => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/256443123887/catalogItemsQueue';
  if (!queueUrl) {
    throw new Error('CATALOG_ITEMS_QUEUE_URL environment variable not set');
  }

  // Assuming event.records or event.body contains array of items to send
  const items = JSON.parse(event.body || '[]');

  // Send each item as a separate SQS message
  const sendPromises = items.map(async (item: any) => {
    const messageBody = JSON.stringify(item);

    return sqsClient.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: messageBody,
      })
    );
  });

  await Promise.all(sendPromises);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Messages sent to SQS' }),
  };
};
