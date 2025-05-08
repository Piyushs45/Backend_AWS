import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const PRODUCTS_TABLE = 'ProductsTable';
const STOCK_TABLE = 'StockTable';

export const handler = async () => {
  try {
    const productsResult = await client.send(new ScanCommand({ TableName: PRODUCTS_TABLE }));
    const stockResult = await client.send(new ScanCommand({ TableName: STOCK_TABLE }));

    const stockMap = new Map<string, number>();
    for (const stock of stockResult.Items || []) {
      stockMap.set(stock.product_id, stock.count);
    }

    const joined = (productsResult.Items || []).map(product => ({
      ...product,
      count: stockMap.get(product.id) || 0,
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify(joined),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
