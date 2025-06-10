import { S3Event, Context, Callback, S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

const s3 = new S3Client({ region: 'us-east-1' });
const sqs = new SQSClient({ region: 'us-east-1' });

const QUEUE_URL = process.env.SQS_URL!;
if (!QUEUE_URL) {
  throw new Error('SQS_URL environment variable must be defined');
}

export const main: S3Handler = async (
  event: S3Event,
  context: Context,
  callback: Callback
) => {
  if (!event.Records || event.Records.length === 0) {
    return callback(new Error('No S3 records found in the event'));
  }

  const record = event.Records[0];
  const bucketName = record.s3.bucket.name;
  const objectKey = record.s3.object.key;

  if (!objectKey.startsWith('uploaded/products.csv')) {
    return callback(new Error('Only "uploaded/products.csv" is allowed'));
  }

  try {
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const s3Object = await s3.send(getObjectCommand);
    const s3Stream = s3Object.Body as Readable;

    const sendMessagePromises: Promise<any>[] = [];

    await new Promise<void>((resolve, reject) => {
      s3Stream
        .pipe(csvParser())
        .on('data', (csvRecord) => {
          const messageBody = JSON.stringify(csvRecord);

          const sendPromise = sqs.send(
            new SendMessageCommand({
              QueueUrl: QUEUE_URL,
              MessageBody: messageBody,
            })
          );

          sendMessagePromises.push(sendPromise);
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    await Promise.all(sendMessagePromises);

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: 'CSV parsed and messages sent to SQS successfully',
      }),
    });
  } catch (error) {
    callback(error as Error);
  }
};
