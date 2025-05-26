import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.BUCKET_NAME || "import-service-demo-bucket";

export async function handler(event: any) {
  try {
    const fileName = event.queryStringParameters?.fileName;

    if (!fileName || !fileName.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "fileName query parameter is required",
        }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      };
    }

    const trimmedFileName = fileName.trim();
    const key = `uploaded/${trimmedFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // Generate signed URL valid for 1 hour (3600 seconds)
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return {
      statusCode: 200,
      body: JSON.stringify({
        signedUrl,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    };
  } catch (error: any) {
    console.error("Error generating signed URL:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to generate signed URL",
        error: error.message,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    };
  }
}
