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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrQkFBa0I7QUFDbEIsOERBQTBEO0FBQzFELHdEQUEyRTtBQUMzRSwrQkFBb0M7QUFFcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLHFDQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUV0RCxNQUFNLFFBQVEsR0FBRztJQUNmO1FBQ0UsRUFBRSxFQUFFLElBQUEsU0FBTSxHQUFFO1FBQ1osS0FBSyxFQUFFLGFBQWE7UUFDcEIsV0FBVyxFQUFFLGNBQWM7UUFDM0IsS0FBSyxFQUFFLElBQUk7UUFDWCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsSUFBQSxTQUFNLEdBQUU7UUFDWixLQUFLLEVBQUUsYUFBYTtRQUNwQixXQUFXLEVBQUUsc0JBQXNCO1FBQ25DLEtBQUssRUFBRSxJQUFJO1FBQ1gsS0FBSyxFQUFFLENBQUM7S0FDVDtDQUNGLENBQUM7QUFFRixDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ1YsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUMvQixNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQ2xCLElBQUkseUJBQVUsQ0FBQztZQUNiLFNBQVMsRUFBRSxlQUFlO1lBQzFCLElBQUksRUFBRTtnQkFDSixFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ2QsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2dCQUNwQixXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7Z0JBQ2hDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSzthQUNyQjtTQUNGLENBQUMsQ0FDSCxDQUFDO1FBQ0YsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUNsQixJQUFJLHlCQUFVLENBQUM7WUFDYixTQUFTLEVBQUUsWUFBWTtZQUN2QixJQUFJLEVBQUU7Z0JBQ0osVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO2dCQUN0QixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7YUFDckI7U0FDRixDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7SUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHNjcmlwdHMvc2VlZC50c1xyXG5pbXBvcnQgeyBEeW5hbW9EQkNsaWVudCB9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcclxuaW1wb3J0IHsgRHluYW1vREJEb2N1bWVudENsaWVudCwgUHV0Q29tbWFuZCB9IGZyb20gXCJAYXdzLXNkay9saWItZHluYW1vZGJcIjtcclxuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSBcInV1aWRcIjtcclxuXHJcbmNvbnN0IGNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7fSk7XHJcbmNvbnN0IGRvY0NsaWVudCA9IER5bmFtb0RCRG9jdW1lbnRDbGllbnQuZnJvbShjbGllbnQpO1xyXG5cclxuY29uc3QgcHJvZHVjdHMgPSBbXHJcbiAge1xyXG4gICAgaWQ6IHV1aWR2NCgpLFxyXG4gICAgdGl0bGU6IFwiTWFjQm9vayBQcm9cIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIkFwcGxlIGxhcHRvcFwiLFxyXG4gICAgcHJpY2U6IDI1MDAsXHJcbiAgICBjb3VudDogMyxcclxuICB9LFxyXG4gIHtcclxuICAgIGlkOiB1dWlkdjQoKSxcclxuICAgIHRpdGxlOiBcIkRlbGwgWFBTIDE1XCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJEZWxsIGhpZ2gtZW5kIGxhcHRvcFwiLFxyXG4gICAgcHJpY2U6IDIyMDAsXHJcbiAgICBjb3VudDogNSxcclxuICB9LFxyXG5dO1xyXG5cclxuKGFzeW5jICgpID0+IHtcclxuICBmb3IgKGNvbnN0IHByb2R1Y3Qgb2YgcHJvZHVjdHMpIHtcclxuICAgIGF3YWl0IGRvY0NsaWVudC5zZW5kKFxyXG4gICAgICBuZXcgUHV0Q29tbWFuZCh7XHJcbiAgICAgICAgVGFibGVOYW1lOiBcIlByb2R1Y3RzVGFibGVcIixcclxuICAgICAgICBJdGVtOiB7XHJcbiAgICAgICAgICBpZDogcHJvZHVjdC5pZCxcclxuICAgICAgICAgIHRpdGxlOiBwcm9kdWN0LnRpdGxlLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246IHByb2R1Y3QuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICBwcmljZTogcHJvZHVjdC5wcmljZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICAgIGF3YWl0IGRvY0NsaWVudC5zZW5kKFxyXG4gICAgICBuZXcgUHV0Q29tbWFuZCh7XHJcbiAgICAgICAgVGFibGVOYW1lOiBcIlN0b2NrVGFibGVcIixcclxuICAgICAgICBJdGVtOiB7XHJcbiAgICAgICAgICBwcm9kdWN0X2lkOiBwcm9kdWN0LmlkLFxyXG4gICAgICAgICAgY291bnQ6IHByb2R1Y3QuY291bnQsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGNvbnNvbGUubG9nKFwiU2VlZCBkYXRhIGluc2VydGVkIVwiKTtcclxufSkoKTtcclxuIl19