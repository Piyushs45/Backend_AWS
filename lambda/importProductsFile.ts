import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { headers } from "./helper"; // Assuming you have a shared headers module

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.BUCKET_NAME!;

export const main = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("API Gateway Event Received:", JSON.stringify(event));

  // Validate the fileName query parameter
  const fileName = event.queryStringParameters?.fileName;
  if (!fileName || !fileName.trim()) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: "fileName query parameter is required.",
      }),
    };
  }

  try {
    const trimmedFileName = fileName.trim();
    const key = `uploaded/${trimmedFileName}`;

    // Generate a signed URL valid for 5 minutes (300 seconds)
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: "text/csv", // Specify CSV file type
    });

    const signedUrl = await getSignedUrl(s3, putCommand, { expiresIn: 300 });

    console.log("Generated Signed URL:", signedUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Signed URL generated successfully",
        signedUrl,
      }),
    };
  } catch (error: any) {
    console.error("Error generating signed URL:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Failed to generate signed URL",
        error: error.message || String(error),
      }),
    };
  }
};
