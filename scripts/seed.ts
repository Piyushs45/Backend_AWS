// scripts/seed.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const products = [
  {
    id: uuidv4(),
    title: "MacBook Pro",
    description: "Apple laptop",
    price: 2500,
    count: 3,
  },
  {
    id: uuidv4(),
    title: "Dell XPS 15",
    description: "Dell high-end laptop",
    price: 2200,
    count: 5,
  },
];

(async () => {
  for (const product of products) {
    await docClient.send(
      new PutCommand({
        TableName: "ProductsTable",
        Item: {
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
        },
      })
    );
    await docClient.send(
      new PutCommand({
        TableName: "StockTable",
        Item: {
          product_id: product.id,
          count: product.count,
        },
      })
    );
  }
  console.log("Seed data inserted!");
})();
