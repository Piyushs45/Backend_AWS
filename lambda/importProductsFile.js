"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.BUCKET_NAME || "import-service-demo-bucket";
async function handler(event) {
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
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        // Generate signed URL valid for 1 hour (3600 seconds)
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
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
    }
    catch (error) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0UHJvZHVjdHNGaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1wb3J0UHJvZHVjdHNGaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsMEJBd0RDO0FBOURELHdFQUE2RDtBQUM3RCxrREFBZ0U7QUFFaEUsTUFBTSxFQUFFLEdBQUcsSUFBSSxvQkFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztBQUM1RCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSw0QkFBNEIsQ0FBQztBQUVwRSxLQUFLLFVBQVUsT0FBTyxDQUFDLEtBQVU7SUFDdEMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixFQUFFLFFBQVEsQ0FBQztRQUV2RCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7WUFDbEMsT0FBTztnQkFDTCxVQUFVLEVBQUUsR0FBRztnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDbkIsT0FBTyxFQUFFLHNDQUFzQztpQkFDaEQsQ0FBQztnQkFDRixPQUFPLEVBQUU7b0JBQ1AsNkJBQTZCLEVBQUUsR0FBRztvQkFDbEMsOEJBQThCLEVBQUUsY0FBYztvQkFDOUMsOEJBQThCLEVBQUUsY0FBYztpQkFDL0M7YUFDRixDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QyxNQUFNLEdBQUcsR0FBRyxZQUFZLGVBQWUsRUFBRSxDQUFDO1FBRTFDLE1BQU0sT0FBTyxHQUFHLElBQUksNEJBQWdCLENBQUM7WUFDbkMsTUFBTSxFQUFFLFVBQVU7WUFDbEIsR0FBRyxFQUFFLEdBQUc7U0FDVCxDQUFDLENBQUM7UUFFSCxzREFBc0Q7UUFDdEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLG1DQUFZLEVBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRXZFLE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNuQixTQUFTO2FBQ1YsQ0FBQztZQUNGLE9BQU8sRUFBRTtnQkFDUCw2QkFBNkIsRUFBRSxHQUFHO2dCQUNsQyw4QkFBOEIsRUFBRSxjQUFjO2dCQUM5Qyw4QkFBOEIsRUFBRSxjQUFjO2FBQy9DO1NBQ0YsQ0FBQztJQUNKLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFckQsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSwrQkFBK0I7Z0JBQ3hDLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTzthQUNyQixDQUFDO1lBQ0YsT0FBTyxFQUFFO2dCQUNQLDZCQUE2QixFQUFFLEdBQUc7Z0JBQ2xDLDhCQUE4QixFQUFFLGNBQWM7Z0JBQzlDLDhCQUE4QixFQUFFLGNBQWM7YUFDL0M7U0FDRixDQUFDO0lBQ0osQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRTaWduZWRVcmwgfSBmcm9tIFwiQGF3cy1zZGsvczMtcmVxdWVzdC1wcmVzaWduZXJcIjtcbmltcG9ydCB7IFMzQ2xpZW50LCBQdXRPYmplY3RDb21tYW5kIH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zM1wiO1xuXG5jb25zdCBzMyA9IG5ldyBTM0NsaWVudCh7IHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB9KTtcbmNvbnN0IGJ1Y2tldE5hbWUgPSBwcm9jZXNzLmVudi5CVUNLRVRfTkFNRSB8fCBcImltcG9ydC1zZXJ2aWNlLWRlbW8tYnVja2V0XCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKGV2ZW50OiBhbnkpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBmaWxlTmFtZSA9IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycz8uZmlsZU5hbWU7XG5cbiAgICBpZiAoIWZpbGVOYW1lIHx8ICFmaWxlTmFtZS50cmltKCkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIG1lc3NhZ2U6IFwiZmlsZU5hbWUgcXVlcnkgcGFyYW1ldGVyIGlzIHJlcXVpcmVkXCIsXG4gICAgICAgIH0pLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIsXG4gICAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IFwiQ29udGVudC1UeXBlXCIsXG4gICAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IFwiR0VULCBPUFRJT05TXCIsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHRyaW1tZWRGaWxlTmFtZSA9IGZpbGVOYW1lLnRyaW0oKTtcbiAgICBjb25zdCBrZXkgPSBgdXBsb2FkZWQvJHt0cmltbWVkRmlsZU5hbWV9YDtcblxuICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgUHV0T2JqZWN0Q29tbWFuZCh7XG4gICAgICBCdWNrZXQ6IGJ1Y2tldE5hbWUsXG4gICAgICBLZXk6IGtleSxcbiAgICB9KTtcblxuICAgIC8vIEdlbmVyYXRlIHNpZ25lZCBVUkwgdmFsaWQgZm9yIDEgaG91ciAoMzYwMCBzZWNvbmRzKVxuICAgIGNvbnN0IHNpZ25lZFVybCA9IGF3YWl0IGdldFNpZ25lZFVybChzMywgY29tbWFuZCwgeyBleHBpcmVzSW46IDM2MDAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzaWduZWRVcmwsXG4gICAgICB9KSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIsXG4gICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiBcIkNvbnRlbnQtVHlwZVwiLFxuICAgICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogXCJHRVQsIE9QVElPTlNcIixcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBnZW5lcmF0aW5nIHNpZ25lZCBVUkw6XCIsIGVycm9yKTtcblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIG1lc3NhZ2U6IFwiRmFpbGVkIHRvIGdlbmVyYXRlIHNpZ25lZCBVUkxcIixcbiAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXG4gICAgICB9KSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIsXG4gICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiBcIkNvbnRlbnQtVHlwZVwiLFxuICAgICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogXCJHRVQsIE9QVElPTlNcIixcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxufVxuIl19