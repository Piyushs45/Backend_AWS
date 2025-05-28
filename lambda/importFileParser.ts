import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

const s3 = new S3Client({ region: 'us-east-1' });
const sqs = new SQSClient({ region: 'us-east-1' });

const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/256443123887/catalogItemsQueue';

if (!QUEUE_URL) {
  throw new Error('CATALOG_ITEMS_QUEUE_URL environment variable is not set');
}

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const params = {
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key,
    };

    console.log(`Processing file from S3: ${params.Bucket}/${params.Key}`);

    const s3Object = await s3.send(new GetObjectCommand(params));
    const stream = s3Object.Body as Readable;

    const messages: Promise<any>[] = [];

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (data) => {
          console.log('Parsed row:', data);
          messages.push(
            sqs.send(
              new SendMessageCommand({
                QueueUrl: QUEUE_URL,
                MessageBody: JSON.stringify(data),
              })
            )
          );
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Wait for all SQS messages to be sent
    await Promise.all(messages);

    console.log(`Finished processing file: ${params.Key}`);
  }
};
