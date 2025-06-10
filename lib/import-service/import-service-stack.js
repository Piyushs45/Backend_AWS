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
const sqs = require("aws-cdk-lib/aws-sqs");
class ImportServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create S3 bucket
        const bucket = new s3.Bucket(this, 'ImportBucket', {
            versioned: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });
        // Deploy placeholder file to create uploaded/ folder
        new s3deploy.BucketDeployment(this, 'DeployUploadedFolder', {
            sources: [s3deploy.Source.data('uploaded/.keep', '')],
            destinationBucket: bucket,
            destinationKeyPrefix: 'uploaded/',
        });
        // Import the SQS queue (created in another stack)
        const catalogItemsQueue = sqs.Queue.fromQueueArn(this, 'ImportedCatalogQueue', 'arn:aws:sqs:us-east-1:256443123887:catalogItemsQueue');
        // Lambda to generate signed URL
        const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFile', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'importProductsFile.handler',
            environment: {
                BUCKET_NAME: bucket.bucketName,
            },
        });
        // Lambda to parse uploaded CSV and send to SQS
        const importFileParserLambda = new lambda.Function(this, 'ImportFileParser', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'importFileParser.handler',
            environment: {
                BUCKET_NAME: bucket.bucketName,
                CATALOG_ITEMS_QUEUE_URL: catalogItemsQueue.queueUrl,
            },
        });
        // Grant permissions
        bucket.grantPut(importProductsFileLambda);
        bucket.grantRead(importFileParserLambda);
        catalogItemsQueue.grantSendMessages(importFileParserLambda); // ✅ Important fix
        // Add S3 → Lambda trigger
        bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(importFileParserLambda), { prefix: 'uploaded/' });
        // API Gateway setup
        const api = new apigateway.RestApi(this, 'ImportServiceApi', {
            restApiName: 'Import Products Service',
        });
        const importProductsResource = api.root.addResource('import');
        importProductsResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda));
        importProductsResource.addCorsPreflight({
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: ['GET'],
        });
    }
}
exports.ImportServiceStack = ImportServiceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LXNlcnZpY2Utc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbXBvcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtQ0FBbUM7QUFDbkMseUNBQXlDO0FBQ3pDLHdEQUF3RDtBQUN4RCwwREFBMEQ7QUFDMUQsaURBQWlEO0FBQ2pELDZCQUE2QjtBQUM3Qix5REFBeUQ7QUFDekQsMkNBQTJDO0FBRzNDLE1BQWEsa0JBQW1CLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDL0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixtQkFBbUI7UUFDbkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDakQsU0FBUyxFQUFFLElBQUk7WUFDZixhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLElBQUk7U0FDeEIsQ0FBQyxDQUFDO1FBRUgscURBQXFEO1FBQ3JELElBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUMxRCxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxpQkFBaUIsRUFBRSxNQUFNO1lBQ3pCLG9CQUFvQixFQUFFLFdBQVc7U0FDbEMsQ0FBQyxDQUFDO1FBRUgsa0RBQWtEO1FBQ2xELE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQzlDLElBQUksRUFDSixzQkFBc0IsRUFDdEIsc0RBQXNELENBQ3ZELENBQUM7UUFFRixnQ0FBZ0M7UUFDaEMsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQy9FLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzlELE9BQU8sRUFBRSw0QkFBNEI7WUFDckMsV0FBVyxFQUFFO2dCQUNYLFdBQVcsRUFBRSxNQUFNLENBQUMsVUFBVTthQUMvQjtTQUNGLENBQUMsQ0FBQztRQUVILCtDQUErQztRQUMvQyxNQUFNLHNCQUFzQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDM0UsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDOUQsT0FBTyxFQUFFLDBCQUEwQjtZQUNuQyxXQUFXLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLE1BQU0sQ0FBQyxVQUFVO2dCQUM5Qix1QkFBdUIsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRO2FBQ3BEO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsb0JBQW9CO1FBQ3BCLE1BQU0sQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDekMsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQjtRQUUvRSwwQkFBMEI7UUFDMUIsTUFBTSxDQUFDLG9CQUFvQixDQUN6QixFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFDM0IsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsRUFDakQsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQ3hCLENBQUM7UUFFRixvQkFBb0I7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUMzRCxXQUFXLEVBQUUseUJBQXlCO1NBQ3ZDLENBQUMsQ0FBQztRQUVILE1BQU0sc0JBQXNCLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUQsc0JBQXNCLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7UUFFcEcsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUM7WUFDdEMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVztZQUN6QyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7U0FDdEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBdkVELGdEQXVFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgKiBhcyBzM24gZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLW5vdGlmaWNhdGlvbnMnO1xuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLWRlcGxveW1lbnQnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgc3FzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zcXMnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuXG5leHBvcnQgY2xhc3MgSW1wb3J0U2VydmljZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ3JlYXRlIFMzIGJ1Y2tldFxuICAgIGNvbnN0IGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ0ltcG9ydEJ1Y2tldCcsIHtcbiAgICAgIHZlcnNpb25lZDogdHJ1ZSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICB9KTtcblxuICAgIC8vIERlcGxveSBwbGFjZWhvbGRlciBmaWxlIHRvIGNyZWF0ZSB1cGxvYWRlZC8gZm9sZGVyXG4gICAgbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ0RlcGxveVVwbG9hZGVkRm9sZGVyJywge1xuICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5kYXRhKCd1cGxvYWRlZC8ua2VlcCcsICcnKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogYnVja2V0LFxuICAgICAgZGVzdGluYXRpb25LZXlQcmVmaXg6ICd1cGxvYWRlZC8nLFxuICAgIH0pO1xuXG4gICAgLy8gSW1wb3J0IHRoZSBTUVMgcXVldWUgKGNyZWF0ZWQgaW4gYW5vdGhlciBzdGFjaylcbiAgICBjb25zdCBjYXRhbG9nSXRlbXNRdWV1ZSA9IHNxcy5RdWV1ZS5mcm9tUXVldWVBcm4oXG4gICAgICB0aGlzLFxuICAgICAgJ0ltcG9ydGVkQ2F0YWxvZ1F1ZXVlJyxcbiAgICAgICdhcm46YXdzOnNxczp1cy1lYXN0LTE6MjU2NDQzMTIzODg3OmNhdGFsb2dJdGVtc1F1ZXVlJ1xuICAgICk7XG5cbiAgICAvLyBMYW1iZGEgdG8gZ2VuZXJhdGUgc2lnbmVkIFVSTFxuICAgIGNvbnN0IGltcG9ydFByb2R1Y3RzRmlsZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0ltcG9ydFByb2R1Y3RzRmlsZScsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEnKSksXG4gICAgICBoYW5kbGVyOiAnaW1wb3J0UHJvZHVjdHNGaWxlLmhhbmRsZXInLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQlVDS0VUX05BTUU6IGJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIExhbWJkYSB0byBwYXJzZSB1cGxvYWRlZCBDU1YgYW5kIHNlbmQgdG8gU1FTXG4gICAgY29uc3QgaW1wb3J0RmlsZVBhcnNlckxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0ltcG9ydEZpbGVQYXJzZXInLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbGFtYmRhJykpLFxuICAgICAgaGFuZGxlcjogJ2ltcG9ydEZpbGVQYXJzZXIuaGFuZGxlcicsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBCVUNLRVRfTkFNRTogYnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgIENBVEFMT0dfSVRFTVNfUVVFVUVfVVJMOiBjYXRhbG9nSXRlbXNRdWV1ZS5xdWV1ZVVybCxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBHcmFudCBwZXJtaXNzaW9uc1xuICAgIGJ1Y2tldC5ncmFudFB1dChpbXBvcnRQcm9kdWN0c0ZpbGVMYW1iZGEpO1xuICAgIGJ1Y2tldC5ncmFudFJlYWQoaW1wb3J0RmlsZVBhcnNlckxhbWJkYSk7XG4gICAgY2F0YWxvZ0l0ZW1zUXVldWUuZ3JhbnRTZW5kTWVzc2FnZXMoaW1wb3J0RmlsZVBhcnNlckxhbWJkYSk7IC8vIOKchSBJbXBvcnRhbnQgZml4XG5cbiAgICAvLyBBZGQgUzMg4oaSIExhbWJkYSB0cmlnZ2VyXG4gICAgYnVja2V0LmFkZEV2ZW50Tm90aWZpY2F0aW9uKFxuICAgICAgczMuRXZlbnRUeXBlLk9CSkVDVF9DUkVBVEVELFxuICAgICAgbmV3IHMzbi5MYW1iZGFEZXN0aW5hdGlvbihpbXBvcnRGaWxlUGFyc2VyTGFtYmRhKSxcbiAgICAgIHsgcHJlZml4OiAndXBsb2FkZWQvJyB9XG4gICAgKTtcblxuICAgIC8vIEFQSSBHYXRld2F5IHNldHVwXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnSW1wb3J0U2VydmljZUFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnSW1wb3J0IFByb2R1Y3RzIFNlcnZpY2UnLFxuICAgIH0pO1xuXG4gICAgY29uc3QgaW1wb3J0UHJvZHVjdHNSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdpbXBvcnQnKTtcbiAgICBpbXBvcnRQcm9kdWN0c1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW1wb3J0UHJvZHVjdHNGaWxlTGFtYmRhKSk7XG5cbiAgICBpbXBvcnRQcm9kdWN0c1Jlc291cmNlLmFkZENvcnNQcmVmbGlnaHQoe1xuICAgICAgYWxsb3dPcmlnaW5zOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXG4gICAgICBhbGxvd01ldGhvZHM6IFsnR0VUJ10sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==