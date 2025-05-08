"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
// Initialize DynamoDB client and document client
const client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({}));
// Hardcoded table names
const PRODUCTS_TABLE = 'ProductsTable'; // Replace with your actual table name
const STOCK_TABLE = 'StockTable'; // Replace with your actual table name
const handler = async (event) => {
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
        if (!body.title ||
            typeof body.price !== 'number' ||
            typeof body.count !== 'number') {
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
        const productId = (0, uuid_1.v4)();
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
        await client.send(new lib_dynamodb_1.PutCommand({ TableName: PRODUCTS_TABLE, Item: product }));
        // Put the stock into DynamoDB STOCK_TABLE
        await client.send(new lib_dynamodb_1.PutCommand({ TableName: STOCK_TABLE, Item: stock }));
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
    }
    catch (error) {
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
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlUHJvZHVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWF0ZVByb2R1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQTBEO0FBQzFELHdEQUcrQjtBQUMvQiwrQkFBb0M7QUFFcEMsaURBQWlEO0FBQ2pELE1BQU0sTUFBTSxHQUFHLHFDQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUVuRSx3QkFBd0I7QUFDeEIsTUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFDLENBQUMsc0NBQXNDO0FBQzlFLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDLHNDQUFzQztBQUVqRSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBVSxFQUFFLEVBQUU7SUFDMUMscUNBQXFDO0lBQ3JDLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUU7Z0JBQ1AsNkJBQTZCLEVBQUUsdUJBQXVCO2dCQUN0RCw4QkFBOEIsRUFBRSxlQUFlO2dCQUMvQyw4QkFBOEIsRUFBRSxjQUFjO2FBQy9DO1lBQ0QsSUFBSSxFQUFFLEVBQUU7U0FDVCxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQztRQUNILGdDQUFnQztRQUNoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwQyxpQkFBaUI7UUFDakIsSUFDRSxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQ1gsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVE7WUFDOUIsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFDOUIsQ0FBQztZQUNELE9BQU87Z0JBQ0wsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsT0FBTyxFQUFFO29CQUNQLDZCQUE2QixFQUFFLHVCQUF1QjtvQkFDdEQsOEJBQThCLEVBQUUsZUFBZTtvQkFDL0MsOEJBQThCLEVBQUUsY0FBYztpQkFDL0M7Z0JBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQzthQUMzRCxDQUFDO1FBQ0osQ0FBQztRQUVELHdDQUF3QztRQUN4QyxNQUFNLFNBQVMsR0FBRyxJQUFBLFNBQU0sR0FBRSxDQUFDO1FBRTNCLDRCQUE0QjtRQUM1QixNQUFNLE9BQU8sR0FBRztZQUNkLEVBQUUsRUFBRSxTQUFTO1lBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUU7WUFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ2xCLENBQUM7UUFFRiwwQkFBMEI7UUFDMUIsTUFBTSxLQUFLLEdBQUc7WUFDWixVQUFVLEVBQUUsU0FBUztZQUNyQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7U0FDbEIsQ0FBQztRQUVGLCtDQUErQztRQUMvQyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSx5QkFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWhGLDBDQUEwQztRQUMxQyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSx5QkFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTNFLGdFQUFnRTtRQUNoRSxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUU7Z0JBQ1AsNkJBQTZCLEVBQUUsdUJBQXVCO2dCQUN0RCw4QkFBOEIsRUFBRSxlQUFlO2dCQUMvQyw4QkFBOEIsRUFBRSxjQUFjO2FBQy9DO1lBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3pELENBQUM7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUMsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFO2dCQUNQLDZCQUE2QixFQUFFLHVCQUF1QjtnQkFDdEQsOEJBQThCLEVBQUUsZUFBZTtnQkFDL0MsOEJBQThCLEVBQUUsY0FBYzthQUMvQztZQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLENBQUM7U0FDM0QsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDLENBQUM7QUFoRlcsUUFBQSxPQUFPLFdBZ0ZsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IER5bmFtb0RCQ2xpZW50IH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiJztcclxuaW1wb3J0IHtcclxuICBQdXRDb21tYW5kLFxyXG4gIER5bmFtb0RCRG9jdW1lbnRDbGllbnQsXHJcbn0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcclxuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XHJcblxyXG4vLyBJbml0aWFsaXplIER5bmFtb0RCIGNsaWVudCBhbmQgZG9jdW1lbnQgY2xpZW50XHJcbmNvbnN0IGNsaWVudCA9IER5bmFtb0RCRG9jdW1lbnRDbGllbnQuZnJvbShuZXcgRHluYW1vREJDbGllbnQoe30pKTtcclxuXHJcbi8vIEhhcmRjb2RlZCB0YWJsZSBuYW1lc1xyXG5jb25zdCBQUk9EVUNUU19UQUJMRSA9ICdQcm9kdWN0c1RhYmxlJzsgLy8gUmVwbGFjZSB3aXRoIHlvdXIgYWN0dWFsIHRhYmxlIG5hbWVcclxuY29uc3QgU1RPQ0tfVEFCTEUgPSAnU3RvY2tUYWJsZSc7IC8vIFJlcGxhY2Ugd2l0aCB5b3VyIGFjdHVhbCB0YWJsZSBuYW1lXHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudDogYW55KSA9PiB7XHJcbiAgLy8g4pyFIEhhbmRsZSBwcmVmbGlnaHQgT1BUSU9OUyByZXF1ZXN0XHJcbiAgaWYgKGV2ZW50Lmh0dHBNZXRob2QgPT09ICdPUFRJT05TJykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhdHVzQ29kZTogMjAwLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxyXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ1BPU1QsIE9QVElPTlMnLFxyXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6ICcnLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBQYXJzZSB0aGUgYm9keSBvZiB0aGUgcmVxdWVzdFxyXG4gICAgY29uc3QgYm9keSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSk7XHJcblxyXG4gICAgLy8gVmFsaWRhdGUgaW5wdXRcclxuICAgIGlmIChcclxuICAgICAgIWJvZHkudGl0bGUgfHxcclxuICAgICAgdHlwZW9mIGJvZHkucHJpY2UgIT09ICdudW1iZXInIHx8XHJcbiAgICAgIHR5cGVvZiBib2R5LmNvdW50ICE9PSAnbnVtYmVyJ1xyXG4gICAgKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3RhdHVzQ29kZTogNDAwLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ1BPU1QsIE9QVElPTlMnLFxyXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ0ludmFsaWQgcHJvZHVjdCBpbnB1dCcgfSksXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgdW5pcXVlIHByb2R1Y3QgSUQgdXNpbmcgdXVpZFxyXG4gICAgY29uc3QgcHJvZHVjdElkID0gdXVpZHY0KCk7XHJcblxyXG4gICAgLy8gRGVmaW5lIHRoZSBwcm9kdWN0IG9iamVjdFxyXG4gICAgY29uc3QgcHJvZHVjdCA9IHtcclxuICAgICAgaWQ6IHByb2R1Y3RJZCxcclxuICAgICAgdGl0bGU6IGJvZHkudGl0bGUsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBib2R5LmRlc2NyaXB0aW9uIHx8ICcnLFxyXG4gICAgICBwcmljZTogYm9keS5wcmljZSxcclxuICAgIH07XHJcblxyXG4gICAgLy8gRGVmaW5lIHRoZSBzdG9jayBvYmplY3RcclxuICAgIGNvbnN0IHN0b2NrID0ge1xyXG4gICAgICBwcm9kdWN0X2lkOiBwcm9kdWN0SWQsXHJcbiAgICAgIGNvdW50OiBib2R5LmNvdW50LFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBQdXQgdGhlIHByb2R1Y3QgaW50byBEeW5hbW9EQiBQUk9EVUNUU19UQUJMRVxyXG4gICAgYXdhaXQgY2xpZW50LnNlbmQobmV3IFB1dENvbW1hbmQoeyBUYWJsZU5hbWU6IFBST0RVQ1RTX1RBQkxFLCBJdGVtOiBwcm9kdWN0IH0pKTtcclxuXHJcbiAgICAvLyBQdXQgdGhlIHN0b2NrIGludG8gRHluYW1vREIgU1RPQ0tfVEFCTEVcclxuICAgIGF3YWl0IGNsaWVudC5zZW5kKG5ldyBQdXRDb21tYW5kKHsgVGFibGVOYW1lOiBTVE9DS19UQUJMRSwgSXRlbTogc3RvY2sgfSkpO1xyXG5cclxuICAgIC8vIFJldHVybiB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSB3aXRoIHByb2R1Y3QgYW5kIHN0b2NrIGRldGFpbHNcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1c0NvZGU6IDIwMSxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdQT1NULCBPUFRJT05TJyxcclxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxyXG4gICAgICB9LFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IC4uLnByb2R1Y3QsIGNvdW50OiBzdG9jay5jb3VudCB9KSxcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0NyZWF0ZSBwcm9kdWN0IGVycm9yOicsIGVycm9yKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdQT1NULCBPUFRJT05TJyxcclxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxyXG4gICAgICB9LFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InIH0pLFxyXG4gICAgfTtcclxuICB9XHJcbn07XHJcbiJdfQ==