"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportServiceStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const s3 = require("aws-cdk-lib/aws-s3");
const apiGateway = require("aws-cdk-lib/aws-apigateway");
const s3Notifications = require("aws-cdk-lib/aws-s3-notifications");
const path = require("path");
const iam = require("aws-cdk-lib/aws-iam");
class ImportServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Step 1: Create S3 Bucket
        const importBucket = new s3.Bucket(this, 'ImportBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for dev environments
        });
        // Step 2: Define the importProductsFile Lambda function
        const importProductsFile = new lambda.Function(this, 'ImportProductsFile', {
            runtime: lambda.Runtime.NODEJS_18_X, // Use supported runtime
            handler: 'importProductsFile.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // Path to Lambda code
            environment: {
                BUCKET_NAME: importBucket.bucketName,
            },
        });
        // Grant the Lambda function permissions to interact with the S3 bucket
        importBucket.grantPut(importProductsFile);
        // Step 3: Define API Gateway for the Lambda function
        const api = new apiGateway.RestApi(this, 'ImportApi', {
            restApiName: 'ImportServiceAPI',
            description: 'This service handles file imports and parsing.',
        });
        const importResource = api.root.addResource('import');
        importResource.addMethod('GET', new apiGateway.LambdaIntegration(importProductsFile));
        // Step 4: Define the importFileParser Lambda function
        const importFileParser = new lambda.Function(this, 'ImportFileParser', {
            runtime: lambda.Runtime.NODEJS_18_X, // Use supported runtime
            handler: 'importFileParser.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // Path to Lambda code
            environment: {
                BUCKET_NAME: importBucket.bucketName,
            },
        });
        // Grant the Lambda function permissions to read from the S3 bucket
        importBucket.grantRead(importFileParser);
        // Set up S3 event notification to trigger the Lambda function when files are uploaded
        importBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3Notifications.LambdaDestination(importFileParser), { prefix: 'uploaded/' } // Only trigger on files uploaded to the 'uploaded' folder
        );
        // Step 5: Allow Lambda functions to interact with each other and S3
        importProductsFile.addToRolePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject', 's3:PutObject'],
            resources: [`${importBucket.bucketArn}/*`],
        }));
        importFileParser.addToRolePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject', 's3:CopyObject', 's3:DeleteObject'],
            resources: [`${importBucket.bucketArn}/*`],
        }));
    }
}
exports.ImportServiceStack = ImportServiceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LXNlcnZpY2Utc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbXBvcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMsaURBQWlEO0FBQ2pELHlDQUF5QztBQUN6Qyx5REFBeUQ7QUFDekQsb0VBQW9FO0FBQ3BFLDZCQUE2QjtBQUU3QiwyQ0FBMkM7QUFHM0MsTUFBYSxrQkFBbUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMvQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDJCQUEyQjtRQUMzQixNQUFNLFlBQVksR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUN2RCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsNEJBQTRCO1NBQ3ZFLENBQUMsQ0FBQztRQUVILHdEQUF3RDtRQUN4RCxNQUFNLGtCQUFrQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDekUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLHdCQUF3QjtZQUM3RCxPQUFPLEVBQUUsNEJBQTRCO1lBQ3JDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLHNCQUFzQjtZQUN0RixXQUFXLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLFlBQVksQ0FBQyxVQUFVO2FBQ3JDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsdUVBQXVFO1FBQ3ZFLFlBQVksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUUxQyxxREFBcUQ7UUFDckQsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDcEQsV0FBVyxFQUFFLGtCQUFrQjtZQUMvQixXQUFXLEVBQUUsZ0RBQWdEO1NBQzlELENBQUMsQ0FBQztRQUVILE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RELGNBQWMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUV0RixzREFBc0Q7UUFDdEQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3JFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSx3QkFBd0I7WUFDN0QsT0FBTyxFQUFFLDBCQUEwQjtZQUNuQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxzQkFBc0I7WUFDdEYsV0FBVyxFQUFFO2dCQUNYLFdBQVcsRUFBRSxZQUFZLENBQUMsVUFBVTthQUNyQztTQUNGLENBQUMsQ0FBQztRQUVILG1FQUFtRTtRQUNuRSxZQUFZLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFekMsc0ZBQXNGO1FBQ3RGLFlBQVksQ0FBQyxvQkFBb0IsQ0FDL0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQzNCLElBQUksZUFBZSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLEVBQ3ZELEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLDBEQUEwRDtTQUNuRixDQUFDO1FBRUYsb0VBQW9FO1FBQ3BFLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDekQsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQztZQUN6QyxTQUFTLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxTQUFTLElBQUksQ0FBQztTQUMzQyxDQUFDLENBQUMsQ0FBQztRQUVKLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDdkQsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQztZQUM3RCxTQUFTLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxTQUFTLElBQUksQ0FBQztTQUMzQyxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7Q0FDRjtBQTlERCxnREE4REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XHJcbmltcG9ydCAqIGFzIGFwaUdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xyXG5pbXBvcnQgKiBhcyBzM05vdGlmaWNhdGlvbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLW5vdGlmaWNhdGlvbnMnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xyXG5pbXBvcnQgeyBTM0V2ZW50U291cmNlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ldmVudC1zb3VyY2VzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBJbXBvcnRTZXJ2aWNlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG5cclxuICAgIC8vIFN0ZXAgMTogQ3JlYXRlIFMzIEJ1Y2tldFxyXG4gICAgY29uc3QgaW1wb3J0QnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnSW1wb3J0QnVja2V0Jywge1xyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBPbmx5IGZvciBkZXYgZW52aXJvbm1lbnRzXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTdGVwIDI6IERlZmluZSB0aGUgaW1wb3J0UHJvZHVjdHNGaWxlIExhbWJkYSBmdW5jdGlvblxyXG4gICAgY29uc3QgaW1wb3J0UHJvZHVjdHNGaWxlID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW1wb3J0UHJvZHVjdHNGaWxlJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCwgLy8gVXNlIHN1cHBvcnRlZCBydW50aW1lXHJcbiAgICAgIGhhbmRsZXI6ICdpbXBvcnRQcm9kdWN0c0ZpbGUuaGFuZGxlcicsXHJcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbGFtYmRhJykpLCAvLyBQYXRoIHRvIExhbWJkYSBjb2RlXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgQlVDS0VUX05BTUU6IGltcG9ydEJ1Y2tldC5idWNrZXROYW1lLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR3JhbnQgdGhlIExhbWJkYSBmdW5jdGlvbiBwZXJtaXNzaW9ucyB0byBpbnRlcmFjdCB3aXRoIHRoZSBTMyBidWNrZXRcclxuICAgIGltcG9ydEJ1Y2tldC5ncmFudFB1dChpbXBvcnRQcm9kdWN0c0ZpbGUpO1xyXG5cclxuICAgIC8vIFN0ZXAgMzogRGVmaW5lIEFQSSBHYXRld2F5IGZvciB0aGUgTGFtYmRhIGZ1bmN0aW9uXHJcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpR2F0ZXdheS5SZXN0QXBpKHRoaXMsICdJbXBvcnRBcGknLCB7XHJcbiAgICAgIHJlc3RBcGlOYW1lOiAnSW1wb3J0U2VydmljZUFQSScsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhpcyBzZXJ2aWNlIGhhbmRsZXMgZmlsZSBpbXBvcnRzIGFuZCBwYXJzaW5nLicsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBpbXBvcnRSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdpbXBvcnQnKTtcclxuICAgIGltcG9ydFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaUdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW1wb3J0UHJvZHVjdHNGaWxlKSk7XHJcblxyXG4gICAgLy8gU3RlcCA0OiBEZWZpbmUgdGhlIGltcG9ydEZpbGVQYXJzZXIgTGFtYmRhIGZ1bmN0aW9uXHJcbiAgICBjb25zdCBpbXBvcnRGaWxlUGFyc2VyID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW1wb3J0RmlsZVBhcnNlcicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsIC8vIFVzZSBzdXBwb3J0ZWQgcnVudGltZVxyXG4gICAgICBoYW5kbGVyOiAnaW1wb3J0RmlsZVBhcnNlci5oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEnKSksIC8vIFBhdGggdG8gTGFtYmRhIGNvZGVcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBCVUNLRVRfTkFNRTogaW1wb3J0QnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHcmFudCB0aGUgTGFtYmRhIGZ1bmN0aW9uIHBlcm1pc3Npb25zIHRvIHJlYWQgZnJvbSB0aGUgUzMgYnVja2V0XHJcbiAgICBpbXBvcnRCdWNrZXQuZ3JhbnRSZWFkKGltcG9ydEZpbGVQYXJzZXIpO1xyXG5cclxuICAgIC8vIFNldCB1cCBTMyBldmVudCBub3RpZmljYXRpb24gdG8gdHJpZ2dlciB0aGUgTGFtYmRhIGZ1bmN0aW9uIHdoZW4gZmlsZXMgYXJlIHVwbG9hZGVkXHJcbiAgICBpbXBvcnRCdWNrZXQuYWRkRXZlbnROb3RpZmljYXRpb24oXHJcbiAgICAgIHMzLkV2ZW50VHlwZS5PQkpFQ1RfQ1JFQVRFRCxcclxuICAgICAgbmV3IHMzTm90aWZpY2F0aW9ucy5MYW1iZGFEZXN0aW5hdGlvbihpbXBvcnRGaWxlUGFyc2VyKSxcclxuICAgICAgeyBwcmVmaXg6ICd1cGxvYWRlZC8nIH0gLy8gT25seSB0cmlnZ2VyIG9uIGZpbGVzIHVwbG9hZGVkIHRvIHRoZSAndXBsb2FkZWQnIGZvbGRlclxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBTdGVwIDU6IEFsbG93IExhbWJkYSBmdW5jdGlvbnMgdG8gaW50ZXJhY3Qgd2l0aCBlYWNoIG90aGVyIGFuZCBTM1xyXG4gICAgaW1wb3J0UHJvZHVjdHNGaWxlLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XHJcbiAgICAgIGFjdGlvbnM6IFsnczM6R2V0T2JqZWN0JywgJ3MzOlB1dE9iamVjdCddLFxyXG4gICAgICByZXNvdXJjZXM6IFtgJHtpbXBvcnRCdWNrZXQuYnVja2V0QXJufS8qYF0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgaW1wb3J0RmlsZVBhcnNlci5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICBhY3Rpb25zOiBbJ3MzOkdldE9iamVjdCcsICdzMzpDb3B5T2JqZWN0JywgJ3MzOkRlbGV0ZU9iamVjdCddLFxyXG4gICAgICByZXNvdXJjZXM6IFtgJHtpbXBvcnRCdWNrZXQuYnVja2V0QXJufS8qYF0sXHJcbiAgICB9KSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==