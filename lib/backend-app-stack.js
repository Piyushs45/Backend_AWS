"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductServiceStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const path = require("path");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const iam = require("aws-cdk-lib/aws-iam");
class ProductServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create DynamoDB tables
        const productsTable = new dynamodb.Table(this, 'ProductsTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            tableName: 'ProductsTable',
        });
        const stockTable = new dynamodb.Table(this, 'StockTable', {
            partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
            tableName: 'StockTable',
        });
        // Lambda function for creating products
        const createProduct = new lambda.Function(this, 'CreateProduct', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'createProduct.handler', // Ensure this matches the Lambda handler function
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            environment: {
                PRODUCTS_TABLE: productsTable.tableName,
                STOCK_TABLE: stockTable.tableName,
            },
        });
        // Grant Lambda functions permission to read/write data to DynamoDB tables
        productsTable.grantReadWriteData(createProduct);
        stockTable.grantReadWriteData(createProduct);
        // Lambda functions for other operations (GET)
        const getProductsList = new lambda.Function(this, 'GetProductsList', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'getProductList.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            environment: {
                PRODUCTS_TABLE: productsTable.tableName,
            },
        });
        const getProductById = new lambda.Function(this, 'GetProductById', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'getProductById.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            environment: {
                PRODUCTS_TABLE: productsTable.tableName,
            },
        });
        // Grant Lambda functions permission to read from DynamoDB tables
        productsTable.grantReadData(getProductsList);
        productsTable.grantReadData(getProductById);
        // API Gateway setup
        const api = new apigateway.RestApi(this, 'ProductApi', {
            restApiName: 'Product Service',
        });
        const products = api.root.addResource('products');
        // CORS for GET and POST methods
        products.addCorsPreflight({
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: ['GET', 'POST'], // Allow POST as well
            allowHeaders: ['Content-Type'],
        });
        // GET /products method
        products.addMethod('GET', new apigateway.LambdaIntegration(getProductsList, {
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
        // POST /products method for creating a product
        products.addMethod('POST', new apigateway.LambdaIntegration(createProduct, {
            integrationResponses: [
                {
                    statusCode: '201',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                    },
                },
            ],
        }), {
            methodResponses: [
                {
                    statusCode: '201',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': true,
                    },
                },
            ],
        });
        // GET /products/{productId} method
        const singleProduct = products.addResource('{productId}');
        singleProduct.addMethod('GET', new apigateway.LambdaIntegration(getProductById, {
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
        getProductsList.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['dynamodb:Scan'],
            resources: ['arn:aws:dynamodb:us-east-1:256443123887:table/ProductsTable', 'arn:aws:dynamodb:us-east-1:256443123887:table/StockTable'],
        }));
        getProductById.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['dynamodb:Scan', 'dynamodb:GetItem'],
            resources: ['arn:aws:dynamodb:us-east-1:256443123887:table/ProductsTable', 'arn:aws:dynamodb:us-east-1:256443123887:table/StockTable'],
        }));
    }
}
exports.ProductServiceStack = ProductServiceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC1hcHAtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYWNrZW5kLWFwcC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQWlEO0FBQ2pELHlEQUF5RDtBQUN6RCw2QkFBNkI7QUFDN0IscURBQXFEO0FBQ3JELDJDQUEyQztBQUUzQyxNQUFhLG1CQUFvQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ2hELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIseUJBQXlCO1FBQ3pCLE1BQU0sYUFBYSxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQzlELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ2pFLFNBQVMsRUFBRSxlQUFlO1NBQzNCLENBQUMsQ0FBQztRQUVILE1BQU0sVUFBVSxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3hELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3pFLFNBQVMsRUFBRSxZQUFZO1NBQ3hCLENBQUMsQ0FBQztRQUVILHdDQUF3QztRQUN4QyxNQUFNLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUMvRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxrREFBa0Q7WUFDcEYsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxD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Q3ZJLENBQUMsQ0FBQyxDQUFDO0lBRU4sQ0FBQztDQUNGO0FBOUlELGtEQThJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xyXG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XHJcblxyXG5leHBvcnQgY2xhc3MgUHJvZHVjdFNlcnZpY2VTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIER5bmFtb0RCIHRhYmxlc1xyXG4gICAgY29uc3QgcHJvZHVjdHNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnUHJvZHVjdHNUYWJsZScsIHtcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdpZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIHRhYmxlTmFtZTogJ1Byb2R1Y3RzVGFibGUnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgc3RvY2tUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnU3RvY2tUYWJsZScsIHtcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdwcm9kdWN0X2lkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgdGFibGVOYW1lOiAnU3RvY2tUYWJsZScsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIHByb2R1Y3RzXHJcbiAgICBjb25zdCBjcmVhdGVQcm9kdWN0ID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ3JlYXRlUHJvZHVjdCcsIHtcclxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIGhhbmRsZXI6ICdjcmVhdGVQcm9kdWN0LmhhbmRsZXInLCAvLyBFbnN1cmUgdGhpcyBtYXRjaGVzIHRoZSBMYW1iZGEgaGFuZGxlciBmdW5jdGlvblxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYScpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBQUk9EVUNUU19UQUJMRTogcHJvZHVjdHNUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgICAgU1RPQ0tfVEFCTEU6IHN0b2NrVGFibGUudGFibGVOYW1lLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR3JhbnQgTGFtYmRhIGZ1bmN0aW9ucyBwZXJtaXNzaW9uIHRvIHJlYWQvd3JpdGUgZGF0YSB0byBEeW5hbW9EQiB0YWJsZXNcclxuICAgIHByb2R1Y3RzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGNyZWF0ZVByb2R1Y3QpO1xyXG4gICAgc3RvY2tUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoY3JlYXRlUHJvZHVjdCk7XHJcblxyXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9ucyBmb3Igb3RoZXIgb3BlcmF0aW9ucyAoR0VUKVxyXG4gICAgY29uc3QgZ2V0UHJvZHVjdHNMaXN0ID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnR2V0UHJvZHVjdHNMaXN0Jywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogJ2dldFByb2R1Y3RMaXN0LmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYScpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBQUk9EVUNUU19UQUJMRTogcHJvZHVjdHNUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBnZXRQcm9kdWN0QnlJZCA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0dldFByb2R1Y3RCeUlkJywge1xyXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgaGFuZGxlcjogJ2dldFByb2R1Y3RCeUlkLmhhbmRsZXInLFxyXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYScpKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBQUk9EVUNUU19UQUJMRTogcHJvZHVjdHNUYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBHcmFudCBMYW1iZGEgZnVuY3Rpb25zIHBlcm1pc3Npb24gdG8gcmVhZCBmcm9tIER5bmFtb0RCIHRhYmxlc1xyXG4gICAgcHJvZHVjdHNUYWJsZS5ncmFudFJlYWREYXRhKGdldFByb2R1Y3RzTGlzdCk7XHJcbiAgICBwcm9kdWN0c1RhYmxlLmdyYW50UmVhZERhdGEoZ2V0UHJvZHVjdEJ5SWQpO1xyXG5cclxuICAgIC8vIEFQSSBHYXRld2F5IHNldHVwXHJcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdQcm9kdWN0QXBpJywge1xyXG4gICAgICByZXN0QXBpTmFtZTogJ1Byb2R1Y3QgU2VydmljZScsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBwcm9kdWN0cyA9IGFwaS5yb290LmFkZFJlc291cmNlKCdwcm9kdWN0cycpO1xyXG5cclxuICAgIC8vIENPUlMgZm9yIEdFVCBhbmQgUE9TVCBtZXRob2RzXHJcbiAgICBwcm9kdWN0cy5hZGRDb3JzUHJlZmxpZ2h0KHtcclxuICAgICAgYWxsb3dPcmlnaW5zOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXHJcbiAgICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnUE9TVCddLCAvLyBBbGxvdyBQT1NUIGFzIHdlbGxcclxuICAgICAgYWxsb3dIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZSddLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR0VUIC9wcm9kdWN0cyBtZXRob2RcclxuICAgIHByb2R1Y3RzLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0UHJvZHVjdHNMaXN0LCB7XHJcbiAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXHJcbiAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcclxuICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogXCInKidcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0pLCB7XHJcbiAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxyXG4gICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XHJcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IHRydWUsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBQT1NUIC9wcm9kdWN0cyBtZXRob2QgZm9yIGNyZWF0aW5nIGEgcHJvZHVjdFxyXG4gICAgcHJvZHVjdHMuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oY3JlYXRlUHJvZHVjdCwge1xyXG4gICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDEnLFxyXG4gICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XHJcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IFwiJyonXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9KSwge1xyXG4gICAgICBtZXRob2RSZXNwb25zZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAxJyxcclxuICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xyXG4gICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiB0cnVlLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gR0VUIC9wcm9kdWN0cy97cHJvZHVjdElkfSBtZXRob2RcclxuICAgIGNvbnN0IHNpbmdsZVByb2R1Y3QgPSBwcm9kdWN0cy5hZGRSZXNvdXJjZSgne3Byb2R1Y3RJZH0nKTtcclxuICAgIHNpbmdsZVByb2R1Y3QuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRQcm9kdWN0QnlJZCwge1xyXG4gICAgICBpbnRlZ3JhdGlvblJlc3BvbnNlczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHN0YXR1c0NvZGU6ICcyMDAnLFxyXG4gICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzOiB7XHJcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IFwiJyonXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9KSwge1xyXG4gICAgICBtZXRob2RSZXNwb25zZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcclxuICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xyXG4gICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiB0cnVlLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSk7XHJcbiAgICBnZXRQcm9kdWN0c0xpc3QuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcclxuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxyXG4gICAgICBhY3Rpb25zOiBbJ2R5bmFtb2RiOlNjYW4nXSxcclxuICAgICAgcmVzb3VyY2VzOiBbJ2Fybjphd3M6ZHluYW1vZGI6dXMtZWFzdC0xOjI1NjQ0MzEyMzg4Nzp0YWJsZS9Qcm9kdWN0c1RhYmxlJywgJ2Fybjphd3M6ZHluYW1vZGI6dXMtZWFzdC0xOjI1NjQ0MzEyMzg4Nzp0YWJsZS9TdG9ja1RhYmxlJ10sXHJcbiAgICB9KSk7XHJcbiAgICBnZXRQcm9kdWN0QnlJZC5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXHJcbiAgICAgIGFjdGlvbnM6IFsnZHluYW1vZGI6U2NhbicsICdkeW5hbW9kYjpHZXRJdGVtJ10sXHJcbiAgICAgIHJlc291cmNlczogWydhcm46YXdzOmR5bmFtb2RiOnVzLWVhc3QtMToyNTY0NDMxMjM4ODc6dGFibGUvUHJvZHVjdHNUYWJsZScsICdhcm46YXdzOmR5bmFtb2RiOnVzLWVhc3QtMToyNTY0NDMxMjM4ODc6dGFibGUvU3RvY2tUYWJsZSddLFxyXG4gICAgfSkpO1xyXG4gICAgXHJcbiAgfVxyXG59XHJcbiJdfQ==