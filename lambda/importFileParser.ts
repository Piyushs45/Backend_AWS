import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as csv from 'csv-parser';

const s3 = new AWS.S3();

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;

    console.log(`Parsing file from bucket: ${bucket}, key: ${key}`);

    const params = {
      Bucket: bucket,
      Key: key,
    };

    // Create S3 object read stream
    const s3Stream = s3.getObject(params).createReadStream();

    // Wrap stream processing in a promise for async/await
    await new Promise<void>((resolve, reject) => {
      s3Stream
        .pipe(csv())
        .on('data', (data) => {
          console.log('Parsed row:', data);
        })
        .on('end', () => {
          console.log('File parsing completed.');
          resolve();
        })
        .on('error', (err) => {
          console.error('Stream error:', err);
          reject(err);
        });
    });
  }
};
