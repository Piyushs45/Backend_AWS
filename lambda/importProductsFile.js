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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0UHJvZHVjdHNGaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1wb3J0UHJvZHVjdHNGaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsMEJBdUNDO0FBM0NELHFDQUE2QjtBQUU3QixNQUFNLEVBQUUsR0FBRyxJQUFJLFlBQUUsRUFBRSxDQUFDO0FBRWIsS0FBSyxVQUFVLE9BQU8sQ0FBQyxLQUFVO0lBQ3RDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxRQUFRLENBQUM7SUFFdkQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2QsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSxzQ0FBc0M7YUFDaEQsQ0FBQztZQUNGLE9BQU8sRUFBRTtnQkFDUCw2QkFBNkIsRUFBRSxHQUFHLEVBQUUsNkJBQTZCO2dCQUNqRSw4QkFBOEIsRUFBRSxjQUFjO2dCQUM5Qyw4QkFBOEIsRUFBRSxjQUFjLEVBQUUsK0JBQStCO2FBQ2hGO1NBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztJQUMzQyxNQUFNLEtBQUssR0FBRyxZQUFZLFFBQVEsRUFBRSxDQUFDO0lBRXJDLCtDQUErQztJQUMvQyxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRTtRQUM3QyxNQUFNLEVBQUUsVUFBVTtRQUNsQixHQUFHLEVBQUUsS0FBSztRQUNWLE9BQU8sRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLDZCQUE2QjtRQUM5QyxXQUFXLEVBQUUsMEJBQTBCO0tBQ3hDLENBQUMsQ0FBQztJQUVILE9BQU87UUFDTCxVQUFVLEVBQUUsR0FBRztRQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ25CLFNBQVM7U0FDVixDQUFDO1FBQ0YsT0FBTyxFQUFFO1lBQ1AsNkJBQTZCLEVBQUUsR0FBRyxFQUFFLDZCQUE2QjtZQUNqRSw4QkFBOEIsRUFBRSxjQUFjO1lBQzlDLDhCQUE4QixFQUFFLGNBQWMsRUFBRSwrQkFBK0I7U0FDaEY7S0FDRixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFMzIH0gZnJvbSAnYXdzLXNkayc7XHJcblxyXG5jb25zdCBzMyA9IG5ldyBTMygpO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQ6IGFueSkge1xyXG4gIGNvbnN0IGZpbGVOYW1lID0gZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzPy5maWxlTmFtZTtcclxuXHJcbiAgaWYgKCFmaWxlTmFtZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhdHVzQ29kZTogNDAwLFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgbWVzc2FnZTogJ2ZpbGVOYW1lIHF1ZXJ5IHBhcmFtZXRlciBpcyByZXF1aXJlZCcsXHJcbiAgICAgIH0pLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJywgLy8gb3IgcmVzdHJpY3QgdG8geW91ciBkb21haW5cclxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxyXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgT1BUSU9OUycsIC8vIGFkZCBQT1NULCBQVVQgZXRjLiBpZiBuZWVkZWRcclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBidWNrZXROYW1lID0gcHJvY2Vzcy5lbnYuQlVDS0VUX05BTUU7XHJcbiAgY29uc3QgczNLZXkgPSBgdXBsb2FkZWQvJHtmaWxlTmFtZX1gO1xyXG5cclxuICAvLyBHZW5lcmF0ZSBhIHNpZ25lZCBVUkwgZm9yIHVwbG9hZGluZyB0aGUgZmlsZVxyXG4gIGNvbnN0IHNpZ25lZFVybCA9IHMzLmdldFNpZ25lZFVybCgncHV0T2JqZWN0Jywge1xyXG4gICAgQnVja2V0OiBidWNrZXROYW1lLFxyXG4gICAgS2V5OiBzM0tleSxcclxuICAgIEV4cGlyZXM6IDYwICogNSwgLy8gVVJMIGlzIHZhbGlkIGZvciA1IG1pbnV0ZXNcclxuICAgIENvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHN0YXR1c0NvZGU6IDIwMCxcclxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgc2lnbmVkVXJsLFxyXG4gICAgfSksXHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsIC8vIG9yIHJlc3RyaWN0IHRvIHlvdXIgZG9tYWluXHJcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXHJcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgT1BUSU9OUycsIC8vIGFkZCBQT1NULCBQVVQgZXRjLiBpZiBuZWVkZWRcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG4iXX0=