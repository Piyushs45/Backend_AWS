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
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only
        });
        // Step 2: Define the importProductsFile Lambda function
        const importProductsFile = new lambda.Function(this, 'ImportProductsFile', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'importProductsFile.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            environment: {
                BUCKET_NAME: importBucket.bucketName,
            },
        });
        importBucket.grantPut(importProductsFile);
        // Step 3: Define API Gateway with CORS handled manually like ProductService
        const api = new apiGateway.RestApi(this, 'ImportApi', {
            restApiName: 'ImportServiceAPI',
            description: 'This service handles file imports and parsing.',
        });
        const importResource = api.root.addResource('import');
        importResource.addMethod('GET', new apiGateway.LambdaIntegration(importProductsFile, {
            integrationResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                    },
                },
            ],
        }), {
            methodResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': true,
                    },
                },
            ],
        });
        // Also add CORS preflight for GET (like in ProductServiceStack)
        importResource.addCorsPreflight({
            allowOrigins: apiGateway.Cors.ALL_ORIGINS,
            allowMethods: ['GET'],
        });
        // Step 4: Define the importFileParser Lambda
        const importFileParser = new lambda.Function(this, 'ImportFileParser', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'importFileParser.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            environment: {
                BUCKET_NAME: importBucket.bucketName,
            },
        });
        importBucket.grantRead(importFileParser);
        importBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3Notifications.LambdaDestination(importFileParser), { prefix: 'uploaded/' });
        // Step 5: Grant permissions
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LXNlcnZpY2Utc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbXBvcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMsaURBQWlEO0FBQ2pELHlDQUF5QztBQUN6Qyx5REFBeUQ7QUFDekQsb0VBQW9FO0FBQ3BFLDZCQUE2QjtBQUU3QiwyQ0FBMkM7QUFFM0MsTUFBYSxrQkFBbUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMvQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDJCQUEyQjtRQUMzQixNQUFNLFlBQVksR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUN2RCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsdUJBQXVCO1NBQ2xFLENBQUMsQ0FBQztRQUVILHdEQUF3RDtRQUN4RCxNQUFNLGtCQUFrQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDekUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsNEJBQTRCO1lBQ3JDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM5RCxXQUFXLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLFlBQVksQ0FBQyxVQUFVO2FBQ3JDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRTFDLDRFQUE0RTtRQUM1RSxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUNwRCxXQUFXLEVBQUUsa0JBQWtCO1lBQy9CLFdBQVcsRUFBRSxnREFBZ0Q7U0FDOUQsQ0FBQyxDQUFDO1FBRUgsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdEQsY0FBYyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLEVBQUU7WUFDbkYsb0JBQW9CLEVBQUU7Z0JBQ3BCO29CQUNFLFVBQVUsRUFBRSxLQUFLO29CQUNqQixrQkFBa0IsRUFBRTt3QkFDbEIsb0RBQW9ELEVBQUUsS0FBSztxQkFDNUQ7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsRUFBRTtZQUNGLGVBQWUsRUFBRTtnQkFDZjtvQkFDRSxVQUFVLEVBQUUsS0FBSztvQkFDakIsa0JBQWtCLEVBQUU7d0JBQ2xCLG9EQUFvRCxFQUFFLElBQUk7cUJBQzNEO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxnRUFBZ0U7UUFDaEUsY0FBYyxDQUFDLGdCQUFnQixDQUFDO1lBQzlCLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7WUFDekMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDO1NBQ3RCLENBQUMsQ0FBQztRQUVILDZDQUE2QztRQUM3QyxNQUFNLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDckUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsMEJBQTBCO1lBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM5RCxXQUFXLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLFlBQVksQ0FBQyxVQUFVO2FBQ3JDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXpDLFlBQVksQ0FBQyxvQkFBb0IsQ0FDL0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQzNCLElBQUksZUFBZSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLEVBQ3ZELEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUN4QixDQUFDO1FBRUYsNEJBQTRCO1FBQzVCLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDekQsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQztZQUN6QyxTQUFTLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxTQUFTLElBQUksQ0FBQztTQUMzQyxDQUFDLENBQUMsQ0FBQztRQUVKLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDdkQsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQztZQUM3RCxTQUFTLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxTQUFTLElBQUksQ0FBQztTQUMzQyxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7Q0FDRjtBQXBGRCxnREFvRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XHJcbmltcG9ydCAqIGFzIGFwaUdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xyXG5pbXBvcnQgKiBhcyBzM05vdGlmaWNhdGlvbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLW5vdGlmaWNhdGlvbnMnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEltcG9ydFNlcnZpY2VTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gU3RlcCAxOiBDcmVhdGUgUzMgQnVja2V0XHJcbiAgICBjb25zdCBpbXBvcnRCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdJbXBvcnRCdWNrZXQnLCB7XHJcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksIC8vIEZvciBkZXZlbG9wbWVudCBvbmx5XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTdGVwIDI6IERlZmluZSB0aGUgaW1wb3J0UHJvZHVjdHNGaWxlIExhbWJkYSBmdW5jdGlvblxyXG4gICAgY29uc3QgaW1wb3J0UHJvZHVjdHNGaWxlID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW1wb3J0UHJvZHVjdHNGaWxlJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogJ2ltcG9ydFByb2R1Y3RzRmlsZS5oYW5kbGVyJyxcclxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEnKSksXHJcbiAgICAgIGVudmlyb25tZW50OiB7XHJcbiAgICAgICAgQlVDS0VUX05BTUU6IGltcG9ydEJ1Y2tldC5idWNrZXROYW1lLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgaW1wb3J0QnVja2V0LmdyYW50UHV0KGltcG9ydFByb2R1Y3RzRmlsZSk7XHJcblxyXG4gICAgLy8gU3RlcCAzOiBEZWZpbmUgQVBJIEdhdGV3YXkgd2l0aCBDT1JTIGhhbmRsZWQgbWFudWFsbHkgbGlrZSBQcm9kdWN0U2VydmljZVxyXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaUdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnSW1wb3J0QXBpJywge1xyXG4gICAgICByZXN0QXBpTmFtZTogJ0ltcG9ydFNlcnZpY2VBUEknLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgc2VydmljZSBoYW5kbGVzIGZpbGUgaW1wb3J0cyBhbmQgcGFyc2luZy4nLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW1wb3J0UmVzb3VyY2UgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnaW1wb3J0Jyk7XHJcblxyXG4gICAgaW1wb3J0UmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpR2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbXBvcnRQcm9kdWN0c0ZpbGUsIHtcclxuICAgICAgaW50ZWdyYXRpb25SZXNwb25zZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcclxuICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xyXG4gICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiBcIicqJ1wiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSksIHtcclxuICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXHJcbiAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcclxuICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogdHJ1ZSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFsc28gYWRkIENPUlMgcHJlZmxpZ2h0IGZvciBHRVQgKGxpa2UgaW4gUHJvZHVjdFNlcnZpY2VTdGFjaylcclxuICAgIGltcG9ydFJlc291cmNlLmFkZENvcnNQcmVmbGlnaHQoe1xyXG4gICAgICBhbGxvd09yaWdpbnM6IGFwaUdhdGV3YXkuQ29ycy5BTExfT1JJR0lOUyxcclxuICAgICAgYWxsb3dNZXRob2RzOiBbJ0dFVCddLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU3RlcCA0OiBEZWZpbmUgdGhlIGltcG9ydEZpbGVQYXJzZXIgTGFtYmRhXHJcbiAgICBjb25zdCBpbXBvcnRGaWxlUGFyc2VyID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW1wb3J0RmlsZVBhcnNlcicsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6ICdpbXBvcnRGaWxlUGFyc2VyLmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYScpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBCVUNLRVRfTkFNRTogaW1wb3J0QnVja2V0LmJ1Y2tldE5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBpbXBvcnRCdWNrZXQuZ3JhbnRSZWFkKGltcG9ydEZpbGVQYXJzZXIpO1xyXG5cclxuICAgIGltcG9ydEJ1Y2tldC5hZGRFdmVudE5vdGlmaWNhdGlvbihcclxuICAgICAgczMuRXZlbnRUeXBlLk9CSkVDVF9DUkVBVEVELFxyXG4gICAgICBuZXcgczNOb3RpZmljYXRpb25zLkxhbWJkYURlc3RpbmF0aW9uKGltcG9ydEZpbGVQYXJzZXIpLFxyXG4gICAgICB7IHByZWZpeDogJ3VwbG9hZGVkLycgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBTdGVwIDU6IEdyYW50IHBlcm1pc3Npb25zXHJcbiAgICBpbXBvcnRQcm9kdWN0c0ZpbGUuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcclxuICAgICAgYWN0aW9uczogWydzMzpHZXRPYmplY3QnLCAnczM6UHV0T2JqZWN0J10sXHJcbiAgICAgIHJlc291cmNlczogW2Ake2ltcG9ydEJ1Y2tldC5idWNrZXRBcm59LypgXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBpbXBvcnRGaWxlUGFyc2VyLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XHJcbiAgICAgIGFjdGlvbnM6IFsnczM6R2V0T2JqZWN0JywgJ3MzOkNvcHlPYmplY3QnLCAnczM6RGVsZXRlT2JqZWN0J10sXHJcbiAgICAgIHJlc291cmNlczogW2Ake2ltcG9ydEJ1Y2tldC5idWNrZXRBcm59LypgXSxcclxuICAgIH0pKTtcclxuICB9XHJcbn1cclxuIl19