"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
const helper_1 = require("./helper"); // Assuming you have a shared headers module
const s3 = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.BUCKET_NAME;
const main = async (event, context) => {
    console.log("API Gateway Event Received:", JSON.stringify(event));
    // Validate the fileName query parameter
    const fileName = event.queryStringParameters?.fileName;
    if (!fileName || !fileName.trim()) {
        return {
            statusCode: 400,
            headers: helper_1.headers,
            body: JSON.stringify({
                message: "fileName query parameter is required.",
            }),
        };
    }
    try {
        const trimmedFileName = fileName.trim();
        const key = `uploaded/${trimmedFileName}`;
        // Generate a signed URL valid for 5 minutes (300 seconds)
        const putCommand = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: "text/csv", // Specify CSV file type
        });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, putCommand, { expiresIn: 300 });
        console.log("Generated Signed URL:", signedUrl);
        return {
            statusCode: 200,
            headers: helper_1.headers,
            body: JSON.stringify({
                message: "Signed URL generated successfully",
                signedUrl,
            }),
        };
    }
    catch (error) {
        console.error("Error generating signed URL:", error);
        return {
            statusCode: 500,
            headers: helper_1.headers,
            body: JSON.stringify({
                message: "Failed to generate signed URL",
                error: error.message || String(error),
            }),
        };
    }
};
exports.main = main;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0UHJvZHVjdHNGaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1wb3J0UHJvZHVjdHNGaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdFQUE2RDtBQUM3RCxrREFBZ0U7QUFNaEUscUNBQW1DLENBQUMsNENBQTRDO0FBRWhGLE1BQU0sRUFBRSxHQUFHLElBQUksb0JBQVEsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDNUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFZLENBQUM7QUFFckMsTUFBTSxJQUFJLEdBQUcsS0FBSyxFQUN2QixLQUEyQixFQUMzQixPQUFnQixFQUNnQixFQUFFO0lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRWxFLHdDQUF3QztJQUN4QyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMscUJBQXFCLEVBQUUsUUFBUSxDQUFDO0lBQ3ZELElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUNsQyxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQVAsZ0JBQU87WUFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDbkIsT0FBTyxFQUFFLHVDQUF1QzthQUNqRCxDQUFDO1NBQ0gsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEMsTUFBTSxHQUFHLEdBQUcsWUFBWSxlQUFlLEVBQUUsQ0FBQztRQUUxQywwREFBMEQ7UUFDMUQsTUFBTSxVQUFVLEdBQUcsSUFBSSw0QkFBZ0IsQ0FBQztZQUN0QyxNQUFNLEVBQUUsVUFBVTtZQUNsQixHQUFHLEVBQUUsR0FBRztZQUNSLFdBQVcsRUFBRSxVQUFVLEVBQUUsd0JBQXdCO1NBQ2xELENBQUMsQ0FBQztRQUVILE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSxtQ0FBWSxFQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUV6RSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRWhELE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBUCxnQkFBTztZQUNQLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNuQixPQUFPLEVBQUUsbUNBQW1DO2dCQUM1QyxTQUFTO2FBQ1YsQ0FBQztTQUNILENBQUM7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXJELE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBUCxnQkFBTztZQUNQLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNuQixPQUFPLEVBQUUsK0JBQStCO2dCQUN4QyxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDO2FBQ3RDLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUMsQ0FBQztBQXJEVyxRQUFBLElBQUksUUFxRGYiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRTaWduZWRVcmwgfSBmcm9tIFwiQGF3cy1zZGsvczMtcmVxdWVzdC1wcmVzaWduZXJcIjtcbmltcG9ydCB7IFMzQ2xpZW50LCBQdXRPYmplY3RDb21tYW5kIH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zM1wiO1xuaW1wb3J0IHtcbiAgQVBJR2F0ZXdheVByb3h5RXZlbnQsXG4gIEFQSUdhdGV3YXlQcm94eVJlc3VsdCxcbiAgQ29udGV4dCxcbn0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7IGhlYWRlcnMgfSBmcm9tIFwiLi9oZWxwZXJcIjsgLy8gQXNzdW1pbmcgeW91IGhhdmUgYSBzaGFyZWQgaGVhZGVycyBtb2R1bGVcblxuY29uc3QgczMgPSBuZXcgUzNDbGllbnQoeyByZWdpb246IHByb2Nlc3MuZW52LkFXU19SRUdJT04gfSk7XG5jb25zdCBidWNrZXROYW1lID0gcHJvY2Vzcy5lbnYuQlVDS0VUX05BTUUhO1xuXG5leHBvcnQgY29uc3QgbWFpbiA9IGFzeW5jIChcbiAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50LFxuICBjb250ZXh0OiBDb250ZXh0XG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuICBjb25zb2xlLmxvZyhcIkFQSSBHYXRld2F5IEV2ZW50IFJlY2VpdmVkOlwiLCBKU09OLnN0cmluZ2lmeShldmVudCkpO1xuXG4gIC8vIFZhbGlkYXRlIHRoZSBmaWxlTmFtZSBxdWVyeSBwYXJhbWV0ZXJcbiAgY29uc3QgZmlsZU5hbWUgPSBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnM/LmZpbGVOYW1lO1xuICBpZiAoIWZpbGVOYW1lIHx8ICFmaWxlTmFtZS50cmltKCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgbWVzc2FnZTogXCJmaWxlTmFtZSBxdWVyeSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQuXCIsXG4gICAgICB9KSxcbiAgICB9O1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCB0cmltbWVkRmlsZU5hbWUgPSBmaWxlTmFtZS50cmltKCk7XG4gICAgY29uc3Qga2V5ID0gYHVwbG9hZGVkLyR7dHJpbW1lZEZpbGVOYW1lfWA7XG5cbiAgICAvLyBHZW5lcmF0ZSBhIHNpZ25lZCBVUkwgdmFsaWQgZm9yIDUgbWludXRlcyAoMzAwIHNlY29uZHMpXG4gICAgY29uc3QgcHV0Q29tbWFuZCA9IG5ldyBQdXRPYmplY3RDb21tYW5kKHtcbiAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcbiAgICAgIEtleToga2V5LFxuICAgICAgQ29udGVudFR5cGU6IFwidGV4dC9jc3ZcIiwgLy8gU3BlY2lmeSBDU1YgZmlsZSB0eXBlXG4gICAgfSk7XG5cbiAgICBjb25zdCBzaWduZWRVcmwgPSBhd2FpdCBnZXRTaWduZWRVcmwoczMsIHB1dENvbW1hbmQsIHsgZXhwaXJlc0luOiAzMDAgfSk7XG5cbiAgICBjb25zb2xlLmxvZyhcIkdlbmVyYXRlZCBTaWduZWQgVVJMOlwiLCBzaWduZWRVcmwpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIG1lc3NhZ2U6IFwiU2lnbmVkIFVSTCBnZW5lcmF0ZWQgc3VjY2Vzc2Z1bGx5XCIsXG4gICAgICAgIHNpZ25lZFVybCxcbiAgICAgIH0pLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZ2VuZXJhdGluZyBzaWduZWQgVVJMOlwiLCBlcnJvcik7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgbWVzc2FnZTogXCJGYWlsZWQgdG8gZ2VuZXJhdGUgc2lnbmVkIFVSTFwiLFxuICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCBTdHJpbmcoZXJyb3IpLFxuICAgICAgfSksXG4gICAgfTtcbiAgfVxufTtcbiJdfQ==