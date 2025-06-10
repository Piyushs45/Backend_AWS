"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductServiceStackTask = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const sqs = require("aws-cdk-lib/aws-sqs");
const sns = require("aws-cdk-lib/aws-sns");
const subscriptions = require("aws-cdk-lib/aws-sns-subscriptions");
const eventSources = require("aws-cdk-lib/aws-lambda-event-sources");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const iam = require("aws-cdk-lib/aws-iam"); // <== Make sure this is imported
class ProductServiceStackTask extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'products');
        const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
            queueName: 'catalogItemsQueue'
        });
        const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
            topicName: 'createProductTopic'
        });
        createProductTopic.addSubscription(new subscriptions.EmailSubscription('sandhanpiyush20@gmail.com'));
        const catalogBatchProcess = new lambda.Function(this, 'CatalogBatchProcess', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'catalogBatchProcess.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                SNS_TOPIC_ARN: createProductTopic.topicArn,
                CATALOG_ITEMS_QUEUE_URL: catalogItemsQueue.queueUrl
            }
        });
        // Permissions for DynamoDB and SNS
        productsTable.grantWriteData(catalogBatchProcess);
        createProductTopic.grantPublish(catalogBatchProcess);
        catalogItemsQueue.grantSendMessages(catalogBatchProcess);
        // 🔐 Additional IAM permissions for SQS
        catalogBatchProcess.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'sqs:SendMessage',
                'sqs:ReceiveMessage',
                'sqs:GetQueueUrl',
                'sqs:GetQueueAttributes'
            ],
            resources: [catalogItemsQueue.queueArn]
        }));
        // Connect SQS event source
        catalogBatchProcess.addEventSource(new eventSources.SqsEventSource(catalogItemsQueue, {
            batchSize: 5
        }));
    }
}
exports.ProductServiceStackTask = ProductServiceStackTask;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdC1zZXJ2aWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJvZHVjdC1zZXJ2aWNlLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUVuQyxpREFBaUQ7QUFDakQsMkNBQTJDO0FBQzNDLDJDQUEyQztBQUMzQyxtRUFBbUU7QUFDbkUscUVBQXFFO0FBQ3JFLHFEQUFxRDtBQUNyRCwyQ0FBMkMsQ0FBQyxpQ0FBaUM7QUFFN0UsTUFBYSx1QkFBd0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNwRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFdEYsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ2pFLFNBQVMsRUFBRSxtQkFBbUI7U0FDL0IsQ0FBQyxDQUFDO1FBRUgsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ25FLFNBQVMsRUFBRSxvQkFBb0I7U0FDaEMsQ0FBQyxDQUFDO1FBRUgsa0JBQWtCLENBQUMsZUFBZSxDQUNoQyxJQUFJLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQywyQkFBMkIsQ0FBQyxDQUNqRSxDQUFDO1FBRUYsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQzNFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLDZCQUE2QjtZQUN0QyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3JDLFdBQVcsRUFBRTtnQkFDWCxtQkFBbUIsRUFBRSxhQUFhLENBQUMsU0FBUztnQkFDNUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLFFBQVE7Z0JBQzFDLHVCQUF1QixFQUFFLGlCQUFpQixDQUFDLFFBQVE7YUFDcEQ7U0FDRixDQUFDLENBQUM7UUFFSCxtQ0FBbUM7UUFDbkMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2xELGtCQUFrQixDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JELGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFekQsd0NBQXdDO1FBQ3hDLG1CQUFtQixDQUFDLGVBQWUsQ0FDakMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3RCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDeEIsT0FBTyxFQUFFO2dCQUNQLGlCQUFpQjtnQkFDakIsb0JBQW9CO2dCQUNwQixpQkFBaUI7Z0JBQ2pCLHdCQUF3QjthQUN6QjtZQUNELFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztTQUN4QyxDQUFDLENBQ0gsQ0FBQztRQUVGLDJCQUEyQjtRQUMzQixtQkFBbUIsQ0FBQyxjQUFjLENBQ2hDLElBQUksWUFBWSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRTtZQUNqRCxTQUFTLEVBQUUsQ0FBQztTQUNiLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBdkRELDBEQXVEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIHNxcyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3FzJztcbmltcG9ydCAqIGFzIHNucyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc25zJztcbmltcG9ydCAqIGFzIHN1YnNjcmlwdGlvbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNucy1zdWJzY3JpcHRpb25zJztcbmltcG9ydCAqIGFzIGV2ZW50U291cmNlcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLWV2ZW50LXNvdXJjZXMnO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJzsgLy8gPD09IE1ha2Ugc3VyZSB0aGlzIGlzIGltcG9ydGVkXG5cbmV4cG9ydCBjbGFzcyBQcm9kdWN0U2VydmljZVN0YWNrVGFzayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHByb2R1Y3RzVGFibGUgPSBkeW5hbW9kYi5UYWJsZS5mcm9tVGFibGVOYW1lKHRoaXMsICdQcm9kdWN0c1RhYmxlJywgJ3Byb2R1Y3RzJyk7XG5cbiAgICBjb25zdCBjYXRhbG9nSXRlbXNRdWV1ZSA9IG5ldyBzcXMuUXVldWUodGhpcywgJ0NhdGFsb2dJdGVtc1F1ZXVlJywge1xuICAgICAgcXVldWVOYW1lOiAnY2F0YWxvZ0l0ZW1zUXVldWUnXG4gICAgfSk7XG5cbiAgICBjb25zdCBjcmVhdGVQcm9kdWN0VG9waWMgPSBuZXcgc25zLlRvcGljKHRoaXMsICdDcmVhdGVQcm9kdWN0VG9waWMnLCB7XG4gICAgICB0b3BpY05hbWU6ICdjcmVhdGVQcm9kdWN0VG9waWMnXG4gICAgfSk7XG5cbiAgICBjcmVhdGVQcm9kdWN0VG9waWMuYWRkU3Vic2NyaXB0aW9uKFxuICAgICAgbmV3IHN1YnNjcmlwdGlvbnMuRW1haWxTdWJzY3JpcHRpb24oJ3NhbmRoYW5waXl1c2gyMEBnbWFpbC5jb20nKVxuICAgICk7XG5cbiAgICBjb25zdCBjYXRhbG9nQmF0Y2hQcm9jZXNzID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ2F0YWxvZ0JhdGNoUHJvY2VzcycsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2NhdGFsb2dCYXRjaFByb2Nlc3MuaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYScpLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgUFJPRFVDVFNfVEFCTEVfTkFNRTogcHJvZHVjdHNUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIFNOU19UT1BJQ19BUk46IGNyZWF0ZVByb2R1Y3RUb3BpYy50b3BpY0FybixcbiAgICAgICAgQ0FUQUxPR19JVEVNU19RVUVVRV9VUkw6IGNhdGFsb2dJdGVtc1F1ZXVlLnF1ZXVlVXJsXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQZXJtaXNzaW9ucyBmb3IgRHluYW1vREIgYW5kIFNOU1xuICAgIHByb2R1Y3RzVGFibGUuZ3JhbnRXcml0ZURhdGEoY2F0YWxvZ0JhdGNoUHJvY2Vzcyk7XG4gICAgY3JlYXRlUHJvZHVjdFRvcGljLmdyYW50UHVibGlzaChjYXRhbG9nQmF0Y2hQcm9jZXNzKTtcbiAgICBjYXRhbG9nSXRlbXNRdWV1ZS5ncmFudFNlbmRNZXNzYWdlcyhjYXRhbG9nQmF0Y2hQcm9jZXNzKTtcblxuICAgIC8vIPCflJAgQWRkaXRpb25hbCBJQU0gcGVybWlzc2lvbnMgZm9yIFNRU1xuICAgIGNhdGFsb2dCYXRjaFByb2Nlc3MuYWRkVG9Sb2xlUG9saWN5KFxuICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAnc3FzOlNlbmRNZXNzYWdlJyxcbiAgICAgICAgICAnc3FzOlJlY2VpdmVNZXNzYWdlJyxcbiAgICAgICAgICAnc3FzOkdldFF1ZXVlVXJsJyxcbiAgICAgICAgICAnc3FzOkdldFF1ZXVlQXR0cmlidXRlcydcbiAgICAgICAgXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbY2F0YWxvZ0l0ZW1zUXVldWUucXVldWVBcm5dXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBDb25uZWN0IFNRUyBldmVudCBzb3VyY2VcbiAgICBjYXRhbG9nQmF0Y2hQcm9jZXNzLmFkZEV2ZW50U291cmNlKFxuICAgICAgbmV3IGV2ZW50U291cmNlcy5TcXNFdmVudFNvdXJjZShjYXRhbG9nSXRlbXNRdWV1ZSwge1xuICAgICAgICBiYXRjaFNpemU6IDVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuIl19