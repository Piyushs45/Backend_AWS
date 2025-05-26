"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportServiceStack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const s3n = require("aws-cdk-lib/aws-s3-notifications");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const lambda = require("aws-cdk-lib/aws-lambda");
const path = require("path");
const apigateway = require("aws-cdk-lib/aws-apigateway");
class ImportServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create S3 bucket with versioning and auto-delete on stack removal
        const bucket = new s3.Bucket(this, 'ImportBucket', {
            versioned: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            // optional: bucketName: 'import-service-demo-bucket', // Only if you want fixed global name
        });
        // Deploy empty file to create uploaded/ folder
        new s3deploy.BucketDeployment(this, 'DeployUploadedFolder', {
            sources: [s3deploy.Source.data('uploaded/.keep', '')],
            destinationBucket: bucket,
            destinationKeyPrefix: 'uploaded/',
        });
        // Lambda to generate signed URL for uploads
        const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFile', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // adjust path if needed
            handler: 'importProductsFile.handler',
            environment: {
                BUCKET_NAME: bucket.bucketName,
            },
        });
        // Lambda to process files after upload
        const importFileParserLambda = new lambda.Function(this, 'ImportFileParser', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')), // adjust path if needed
            handler: 'importFileParser.handler',
            environment: {
                BUCKET_NAME: bucket.bucketName,
            },
        });
        // Grant bucket permissions to Lambdas
        bucket.grantPut(importProductsFileLambda);
        bucket.grantRead(importFileParserLambda);
        // Add S3 event notification: on object created in uploaded/ trigger importFileParserLambda
        bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(importFileParserLambda), { prefix: 'uploaded/' });
        // Define API Gateway REST API
        const api = new apigateway.RestApi(this, 'ImportServiceApi', {
            restApiName: 'Import Products Service',
        });
        // Add /import GET endpoint integrated with importProductsFileLambda
        const importProductsResource = api.root.addResource('import');
        importProductsResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda));
        // Optionally, add CORS preflight if your frontend requires it:
        importProductsResource.addCorsPreflight({
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: ['GET'],
        });
    }
}
exports.ImportServiceStack = ImportServiceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LXNlcnZpY2Utc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbXBvcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtQ0FBbUM7QUFDbkMseUNBQXlDO0FBQ3pDLHdEQUF3RDtBQUN4RCwwREFBMEQ7QUFDMUQsaURBQWlEO0FBQ2pELDZCQUE2QjtBQUM3Qix5REFBeUQ7QUFFekQsTUFBYSxrQkFBbUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMvQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLG9FQUFvRTtRQUNwRSxNQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNqRCxTQUFTLEVBQUUsSUFBSTtZQUNmLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtZQUN2Qiw0RkFBNEY7U0FDN0YsQ0FBQyxDQUFDO1FBRUgsK0NBQStDO1FBQy9DLElBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUMxRCxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxpQkFBaUIsRUFBRSxNQUFNO1lBQ3pCLG9CQUFvQixFQUFFLFdBQVc7U0FDbEMsQ0FBQyxDQUFDO1FBRUgsNENBQTRDO1FBQzVDLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUMvRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLHdCQUF3QjtZQUN4RixPQUFPLEVBQUUsNEJBQTRCO1lBQ3JDLFdBQVcsRUFBRTtnQkFDWCxXQUFXLEVBQUUsTUFBTSxDQUFDLFVBQVU7YUFDL0I7U0FDRixDQUFDLENBQUM7UUFFSCx1Q0FBdUM7UUFDdkMsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzNFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsd0JBQXdCO1lBQ3hGLE9BQU8sRUFBRSwwQkFBMEI7WUFDbkMsV0FBVyxFQUFFO2dCQUNYLFdBQVcsRUFBRSxNQUFNLENBQUMsVUFBVTthQUMvQjtTQUNGLENBQUMsQ0FBQztRQUVILHNDQUFzQztRQUN0QyxNQUFNLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRXpDLDJGQUEyRjtRQUMzRixNQUFNLENBQUMsb0JBQW9CLENBQ3pCLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUMzQixJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxzQkFBc0IsQ0FBQyxFQUNqRCxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsQ0FDeEIsQ0FBQztRQUVGLDhCQUE4QjtRQUM5QixNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzNELFdBQVcsRUFBRSx5QkFBeUI7U0FDdkMsQ0FBQyxDQUFDO1FBRUgsb0VBQW9FO1FBQ3BFLE1BQU0sc0JBQXNCLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUQsc0JBQXNCLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7UUFFcEcsK0RBQStEO1FBQy9ELHNCQUFzQixDQUFDLGdCQUFnQixDQUFDO1lBQ3RDLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7WUFDekMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQWpFRCxnREFpRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0ICogYXMgczNuIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMy1ub3RpZmljYXRpb25zJztcbmltcG9ydCAqIGFzIHMzZGVwbG95IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50JztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcblxuZXhwb3J0IGNsYXNzIEltcG9ydFNlcnZpY2VTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIENyZWF0ZSBTMyBidWNrZXQgd2l0aCB2ZXJzaW9uaW5nIGFuZCBhdXRvLWRlbGV0ZSBvbiBzdGFjayByZW1vdmFsXG4gICAgY29uc3QgYnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnSW1wb3J0QnVja2V0Jywge1xuICAgICAgdmVyc2lvbmVkOiB0cnVlLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLFxuICAgICAgLy8gb3B0aW9uYWw6IGJ1Y2tldE5hbWU6ICdpbXBvcnQtc2VydmljZS1kZW1vLWJ1Y2tldCcsIC8vIE9ubHkgaWYgeW91IHdhbnQgZml4ZWQgZ2xvYmFsIG5hbWVcbiAgICB9KTtcblxuICAgIC8vIERlcGxveSBlbXB0eSBmaWxlIHRvIGNyZWF0ZSB1cGxvYWRlZC8gZm9sZGVyXG4gICAgbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ0RlcGxveVVwbG9hZGVkRm9sZGVyJywge1xuICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5kYXRhKCd1cGxvYWRlZC8ua2VlcCcsICcnKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogYnVja2V0LFxuICAgICAgZGVzdGluYXRpb25LZXlQcmVmaXg6ICd1cGxvYWRlZC8nLFxuICAgIH0pO1xuXG4gICAgLy8gTGFtYmRhIHRvIGdlbmVyYXRlIHNpZ25lZCBVUkwgZm9yIHVwbG9hZHNcbiAgICBjb25zdCBpbXBvcnRQcm9kdWN0c0ZpbGVMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdJbXBvcnRQcm9kdWN0c0ZpbGUnLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbGFtYmRhJykpLCAvLyBhZGp1c3QgcGF0aCBpZiBuZWVkZWRcbiAgICAgIGhhbmRsZXI6ICdpbXBvcnRQcm9kdWN0c0ZpbGUuaGFuZGxlcicsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBCVUNLRVRfTkFNRTogYnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gTGFtYmRhIHRvIHByb2Nlc3MgZmlsZXMgYWZ0ZXIgdXBsb2FkXG4gICAgY29uc3QgaW1wb3J0RmlsZVBhcnNlckxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0ltcG9ydEZpbGVQYXJzZXInLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbGFtYmRhJykpLCAvLyBhZGp1c3QgcGF0aCBpZiBuZWVkZWRcbiAgICAgIGhhbmRsZXI6ICdpbXBvcnRGaWxlUGFyc2VyLmhhbmRsZXInLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQlVDS0VUX05BTUU6IGJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEdyYW50IGJ1Y2tldCBwZXJtaXNzaW9ucyB0byBMYW1iZGFzXG4gICAgYnVja2V0LmdyYW50UHV0KGltcG9ydFByb2R1Y3RzRmlsZUxhbWJkYSk7XG4gICAgYnVja2V0LmdyYW50UmVhZChpbXBvcnRGaWxlUGFyc2VyTGFtYmRhKTtcblxuICAgIC8vIEFkZCBTMyBldmVudCBub3RpZmljYXRpb246IG9uIG9iamVjdCBjcmVhdGVkIGluIHVwbG9hZGVkLyB0cmlnZ2VyIGltcG9ydEZpbGVQYXJzZXJMYW1iZGFcbiAgICBidWNrZXQuYWRkRXZlbnROb3RpZmljYXRpb24oXG4gICAgICBzMy5FdmVudFR5cGUuT0JKRUNUX0NSRUFURUQsXG4gICAgICBuZXcgczNuLkxhbWJkYURlc3RpbmF0aW9uKGltcG9ydEZpbGVQYXJzZXJMYW1iZGEpLFxuICAgICAgeyBwcmVmaXg6ICd1cGxvYWRlZC8nIH1cbiAgICApO1xuXG4gICAgLy8gRGVmaW5lIEFQSSBHYXRld2F5IFJFU1QgQVBJXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnSW1wb3J0U2VydmljZUFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnSW1wb3J0IFByb2R1Y3RzIFNlcnZpY2UnLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIC9pbXBvcnQgR0VUIGVuZHBvaW50IGludGVncmF0ZWQgd2l0aCBpbXBvcnRQcm9kdWN0c0ZpbGVMYW1iZGFcbiAgICBjb25zdCBpbXBvcnRQcm9kdWN0c1Jlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2ltcG9ydCcpO1xuICAgIGltcG9ydFByb2R1Y3RzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbXBvcnRQcm9kdWN0c0ZpbGVMYW1iZGEpKTtcblxuICAgIC8vIE9wdGlvbmFsbHksIGFkZCBDT1JTIHByZWZsaWdodCBpZiB5b3VyIGZyb250ZW5kIHJlcXVpcmVzIGl0OlxuICAgIGltcG9ydFByb2R1Y3RzUmVzb3VyY2UuYWRkQ29yc1ByZWZsaWdodCh7XG4gICAgICBhbGxvd09yaWdpbnM6IGFwaWdhdGV3YXkuQ29ycy5BTExfT1JJR0lOUyxcbiAgICAgIGFsbG93TWV0aG9kczogWydHRVQnXSxcbiAgICB9KTtcbiAgfVxufVxuIl19