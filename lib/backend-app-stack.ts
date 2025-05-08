import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
