import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const PRODUCTS_TABLE = 'ProductsTable';
const STOCK_TABLE = 'StockTable';

export const handler = async (event: any) => {
  try {
    if (!event.pathParameters || !event.pathParameters.productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing productId in path' }),
      };
    }

    const { productId } = event.pathParameters;
    const productKey = String(productId);

    console.log("Fetching product with id:", productKey);

    const productResult = await client.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id: productKey },
      })
    );

    console.log("Product result:", productResult);

    if (!productResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    const stockResult = await client.send(
      new GetCommand({
        TableName: STOCK_TABLE,
        Key: { product_id: productKey },
      })
    );

    console.log("Stock result:", stockResult);

    const count = stockResult.Item?.count ?? 0;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ ...productResult.Item, count }),
    };
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
