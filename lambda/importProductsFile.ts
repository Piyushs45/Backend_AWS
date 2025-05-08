import { S3 } from 'aws-sdk';

const s3 = new S3();

export async function handler(event: any) {
  const fileName = event.queryStringParameters?.fileName;

  if (!fileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'fileName query parameter is required',
      }),
      headers: {
        'Access-Control-Allow-Origin': '*', // or restrict to your domain
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS', // add POST, PUT etc. if needed
      },
    };
  }

  const bucketName = process.env.BUCKET_NAME;
  const s3Key = `uploaded/${fileName}`;

  // Generate a signed URL for uploading the file
  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: s3Key,
    Expires: 60 * 5, // URL is valid for 5 minutes
    ContentType: 'application/octet-stream',
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      signedUrl,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*', // or restrict to your domain
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS', // add POST, PUT etc. if needed
    },
  };
}
