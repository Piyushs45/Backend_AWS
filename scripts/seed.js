"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/seed.ts
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const client = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const products = [
    {
        id: (0, uuid_1.v4)(),
        title: "MacBook Pro",
        description: "Apple laptop",
        price: 2500,
        count: 3,
    },
    {
        id: (0, uuid_1.v4)(),
        title: "Dell XPS 15",
        description: "Dell high-end laptop",
        price: 2200,
        count: 5,
    },
];
(async () => {
    for (const product of products) {
        await docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: "ProductsTable",
            Item: {
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price,
            },
        }));
        await docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: "StockTable",
            Item: {
                product_id: product.id,
                count: product.count,
            },
        }));
    }
    console.log("Seed data inserted!");
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrQkFBa0I7QUFDbEIsOERBQTBEO0FBQzFELHdEQUEyRTtBQUMzRSwrQkFBb0M7QUFFcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLHFDQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUV0RCxNQUFNLFFBQVEsR0FBRztJQUNmO1FBQ0UsRUFBRSxFQUFFLElBQUEsU0FBTSxHQUFFO1FBQ1osS0FBSyxFQUFFLGFBQWE7UUFDcEIsV0FBVyxFQUFFLGNBQWM7UUFDM0IsS0FBSyxFQUFFLElBQUk7UUFDWCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsSUFBQSxTQUFNLEdBQUU7UUFDWixLQUFLLEVBQUUsYUFBYTtRQUNwQixXQUFXLEVBQUUsc0JBQXNCO1FBQ25DLEtBQUssRUFBRSxJQUFJO1FBQ1gsS0FBSyxFQUFFLENBQUM7S0FDVDtDQUNGLENBQUM7QUFFRixDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ1YsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUMvQixNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQ2xCLElBQUkseUJBQVUsQ0FBQztZQUNiLFNBQVMsRUFBRSxlQUFlO1lBQzFCLElBQUksRUFBRTtnQkFDSixFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ2QsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUNwQixXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7Z0JBQ2hDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSzthQUNyQjtTQUNGLENBQUMsQ0FDSCxDQUFDO1FBQ0YsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUNsQixJQUFJLHlCQUFVLENBQUM7WUFDYixTQUFTLEVBQUUsWUFBWTtZQUN2QixJQUFJLEVBQUU7Z0JBQ0osVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO2dCQUN0QixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7YUFDckI7U0FDRixDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7SUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHNjcmlwdHMvc2VlZC50c1xuaW1wb3J0IHsgRHluYW1vREJDbGllbnQgfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQgeyBEeW5hbW9EQkRvY3VtZW50Q2xpZW50LCBQdXRDb21tYW5kIH0gZnJvbSBcIkBhd3Mtc2RrL2xpYi1keW5hbW9kYlwiO1xuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSBcInV1aWRcIjtcblxuY29uc3QgY2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHt9KTtcbmNvbnN0IGRvY0NsaWVudCA9IER5bmFtb0RCRG9jdW1lbnRDbGllbnQuZnJvbShjbGllbnQpO1xuXG5jb25zdCBwcm9kdWN0cyA9IFtcbiAge1xuICAgIGlkOiB1dWlkdjQoKSxcbiAgICB0aXRsZTogXCJNYWNCb29rIFByb1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkFwcGxlIGxhcHRvcFwiLFxuICAgIHByaWNlOiAyNTAwLFxuICAgIGNvdW50OiAzLFxuICB9LFxuICB7XG4gICAgaWQ6IHV1aWR2NCgpLFxuICAgIHRpdGxlOiBcIkRlbGwgWFBTIDE1XCIsXG4gICAgZGVzY3JpcHRpb246IFwiRGVsbCBoaWdoLWVuZCBsYXB0b3BcIixcbiAgICBwcmljZTogMjIwMCxcbiAgICBjb3VudDogNSxcbiAgfSxcbl07XG5cbihhc3luYyAoKSA9PiB7XG4gIGZvciAoY29uc3QgcHJvZHVjdCBvZiBwcm9kdWN0cykge1xuICAgIGF3YWl0IGRvY0NsaWVudC5zZW5kKFxuICAgICAgbmV3IFB1dENvbW1hbmQoe1xuICAgICAgICBUYWJsZU5hbWU6IFwiUHJvZHVjdHNUYWJsZVwiLFxuICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgaWQ6IHByb2R1Y3QuaWQsXG4gICAgICAgICAgdGl0bGU6IHByb2R1Y3QudGl0bGUsXG4gICAgICAgICAgZGVzY3JpcHRpb246IHByb2R1Y3QuZGVzY3JpcHRpb24sXG4gICAgICAgICAgcHJpY2U6IHByb2R1Y3QucHJpY2UsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gICAgYXdhaXQgZG9jQ2xpZW50LnNlbmQoXG4gICAgICBuZXcgUHV0Q29tbWFuZCh7XG4gICAgICAgIFRhYmxlTmFtZTogXCJTdG9ja1RhYmxlXCIsXG4gICAgICAgIEl0ZW06IHtcbiAgICAgICAgICBwcm9kdWN0X2lkOiBwcm9kdWN0LmlkLFxuICAgICAgICAgIGNvdW50OiBwcm9kdWN0LmNvdW50LFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIGNvbnNvbGUubG9nKFwiU2VlZCBkYXRhIGluc2VydGVkIVwiKTtcbn0pKCk7XG4iXX0=