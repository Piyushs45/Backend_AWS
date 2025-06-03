import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  PutCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB client and document client
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Hardcoded table names
const PRODUCTS_TABLE = 'ProductsTable'; // Replace with your actual table name
const STOCK_TABLE = 'StockTable'; // Replace with your actual table name

export const handler = async (event: any) => {
  // ✅ Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  try {
    // Parse the body of the request
    const body = JSON.parse(event.body);

    // Validate input
    if (
      !body.title ||
      typeof body.price !== 'number' ||
      typeof body.count !== 'number'
    ) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ message: 'Invalid product input' }),
      };
    }

    // Generate unique product ID using uuid
    const productId = uuidv4();

    // Define the product object
    const product = {
      id: productId,
      title: body.title,
      description: body.description || '',
      price: body.price,
    };

    // Define the stock object
    const stock = {
      product_id: productId,
      count: body.count,
    };

    // Put the product into DynamoDB PRODUCTS_TABLE
    await client.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: product }));

    // Put the stock into DynamoDB STOCK_TABLE
    await client.send(new PutCommand({ TableName: STOCK_TABLE, Item: stock }));

    // Return the successful response with product and stock details
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ ...product, count: stock.count }),
    };
  } catch (error) {
    console.error('Create product error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
