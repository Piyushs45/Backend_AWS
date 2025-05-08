import { S3 } from 'aws-sdk';
import * as csvParser from 'csv-parser';
import { PassThrough } from 'stream';

const s3 = new S3();

export async function handler(event: any) {
  const record = event.Records[0]; // We can assume there will only be one record in the event
  const s3Bucket = record.s3.bucket.name;
  const s3Key = record.s3.object.key;

  console.log(`Processing file: ${s3Key} from bucket: ${s3Bucket}`);

  try {
    // Get the file from S3
    const s3Object = await s3.getObject({
      Bucket: s3Bucket,
      Key: s3Key,
    }).promise();

    // Stream the file content to the CSV parser
    const fileStream = s3Object.Body as PassThrough;
    const records: any[] = [];

    // Parse the CSV file
    fileStream.pipe(csvParser())
      .on('data', (data) => {
        console.log('Parsed record:', data);
        records.push(data);
      })
      .on('end', async () => {
        console.log('CSV Parsing completed, records:', records);

        // Move the file from 'uploaded/' folder to 'parsed/' folder
        const newS3Key = s3Key.replace('uploaded/', 'parsed/');
        await s3.copyObject({
          Bucket: s3Bucket,
          CopySource: `${s3Bucket}/${s3Key}`,
          Key: newS3Key,
        }).promise();

        // Delete the original file from 'uploaded/' folder
        await s3.deleteObject({
          Bucket: s3Bucket,
          Key: s3Key,
        }).promise();

        console.log(`File moved to parsed folder: ${newS3Key}`);
      });
  } catch (error) {
    console.error(`Error processing file ${s3Key}:`, error);
  }
}
