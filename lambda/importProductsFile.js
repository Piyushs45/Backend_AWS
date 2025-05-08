"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const aws_sdk_1 = require("aws-sdk");
const s3 = new aws_sdk_1.S3();
async function handler(event) {
    const fileName = event.queryStringParameters?.fileName;
    if (!fileName) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'fileName query parameter is required',
            }),
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
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0UHJvZHVjdHNGaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1wb3J0UHJvZHVjdHNGaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsMEJBNkJDO0FBakNELHFDQUE2QjtBQUU3QixNQUFNLEVBQUUsR0FBRyxJQUFJLFlBQUUsRUFBRSxDQUFDO0FBRWIsS0FBSyxVQUFVLE9BQU8sQ0FBQyxLQUFVO0lBQ3RDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxRQUFRLENBQUM7SUFFdkQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2QsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSxzQ0FBc0M7YUFDaEQsQ0FBQztTQUNILENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7SUFDM0MsTUFBTSxLQUFLLEdBQUcsWUFBWSxRQUFRLEVBQUUsQ0FBQztJQUVyQywrQ0FBK0M7SUFDL0MsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUU7UUFDN0MsTUFBTSxFQUFFLFVBQVU7UUFDbEIsR0FBRyxFQUFFLEtBQUs7UUFDVixPQUFPLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSw2QkFBNkI7UUFDOUMsV0FBVyxFQUFFLDBCQUEwQjtLQUN4QyxDQUFDLENBQUM7SUFFSCxPQUFPO1FBQ0wsVUFBVSxFQUFFLEdBQUc7UUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNuQixTQUFTO1NBQ1YsQ0FBQztLQUNILENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUzMgfSBmcm9tICdhd3Mtc2RrJztcclxuXHJcbmNvbnN0IHMzID0gbmV3IFMzKCk7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihldmVudDogYW55KSB7XHJcbiAgY29uc3QgZmlsZU5hbWUgPSBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnM/LmZpbGVOYW1lO1xyXG5cclxuICBpZiAoIWZpbGVOYW1lKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBtZXNzYWdlOiAnZmlsZU5hbWUgcXVlcnkgcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyxcclxuICAgICAgfSksXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYnVja2V0TmFtZSA9IHByb2Nlc3MuZW52LkJVQ0tFVF9OQU1FO1xyXG4gIGNvbnN0IHMzS2V5ID0gYHVwbG9hZGVkLyR7ZmlsZU5hbWV9YDtcclxuXHJcbiAgLy8gR2VuZXJhdGUgYSBzaWduZWQgVVJMIGZvciB1cGxvYWRpbmcgdGhlIGZpbGVcclxuICBjb25zdCBzaWduZWRVcmwgPSBzMy5nZXRTaWduZWRVcmwoJ3B1dE9iamVjdCcsIHtcclxuICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcclxuICAgIEtleTogczNLZXksXHJcbiAgICBFeHBpcmVzOiA2MCAqIDUsIC8vIFVSTCBpcyB2YWxpZCBmb3IgNSBtaW51dGVzXHJcbiAgICBDb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbScsXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBzdGF0dXNDb2RlOiAyMDAsXHJcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgIHNpZ25lZFVybCxcclxuICAgIH0pLFxyXG4gIH07XHJcbn1cclxuIl19