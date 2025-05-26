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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlUHJvZHVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWF0ZVByb2R1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQTBEO0FBQzFELHdEQUcrQjtBQUMvQiwrQkFBb0M7QUFFcEMsaURBQWlEO0FBQ2pELE1BQU0sTUFBTSxHQUFHLHFDQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUVuRSx3QkFBd0I7QUFDeEIsTUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFDLENBQUMsc0NBQXNDO0FBQzlFLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDLHNDQUFzQztBQUVqRSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBVSxFQUFFLEVBQUU7SUFDMUMscUNBQXFDO0lBQ3JDLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUU7Z0JBQ1AsNkJBQTZCLEVBQUUsdUJBQXVCO2dCQUN0RCw4QkFBOEIsRUFBRSxlQUFlO2dCQUMvQyw4QkFBOEIsRUFBRSxjQUFjO2FBQy9DO1lBQ0QsSUFBSSxFQUFFLEVBQUU7U0FDVCxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQztRQUNILGdDQUFnQztRQUNoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwQyxpQkFBaUI7UUFDakIsSUFDRSxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQ1gsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVE7WUFDOUIsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFDOUIsQ0FBQztZQUNELE9BQU87Z0JBQ0wsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsT0FBTyxFQUFFO29CQUNQLDZCQUE2QixFQUFFLHVCQUF1QjtvQkFDdEQsOEJBQThCLEVBQUUsZUFBZTtvQkFDL0MsOEJBQThCLEVBQUUsY0FBYztpQkFDL0M7Z0JBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQzthQUMzRCxDQUFDO1FBQ0osQ0FBQztRQUVELHdDQUF3QztRQUN4QyxNQUFNLFNBQVMsR0FBRyxJQUFBLFNBQU0sR0FBRSxDQUFDO1FBRTNCLDRCQUE0QjtRQUM1QixNQUFNLE9BQU8sR0FBRztZQUNkLEVBQUUsRUFBRSxTQUFTO1lBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUU7WUFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ2xCLENBQUM7UUFFRiwwQkFBMEI7UUFDMUIsTUFBTSxLQUFLLEdBQUc7WUFDWixVQUFVLEVBQUUsU0FBUztZQUNyQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7U0FDbEIsQ0FBQztRQUVGLCtDQUErQztRQUMvQyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSx5QkFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWhGLDBDQUEwQztRQUMxQyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSx5QkFBVSxDQUFDLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTNFLGdFQUFnRTtRQUNoRSxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUU7Z0JBQ1AsNkJBQTZCLEVBQUUsdUJBQXVCO2dCQUN0RCw4QkFBOEIsRUFBRSxlQUFlO2dCQUMvQyw4QkFBOEIsRUFBRSxjQUFjO2FBQy9DO1lBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3pELENBQUM7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUMsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFO2dCQUNQLDZCQUE2QixFQUFFLHVCQUF1QjtnQkFDdEQsOEJBQThCLEVBQUUsZUFBZTtnQkFDL0MsOEJBQThCLEVBQUUsY0FBYzthQUMvQztZQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLENBQUM7U0FDM0QsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDLENBQUM7QUFoRlcsUUFBQSxPQUFPLFdBZ0ZsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IER5bmFtb0RCQ2xpZW50IH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiJztcbmltcG9ydCB7XG4gIFB1dENvbW1hbmQsXG4gIER5bmFtb0RCRG9jdW1lbnRDbGllbnQsXG59IGZyb20gJ0Bhd3Mtc2RrL2xpYi1keW5hbW9kYic7XG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tICd1dWlkJztcblxuLy8gSW5pdGlhbGl6ZSBEeW5hbW9EQiBjbGllbnQgYW5kIGRvY3VtZW50IGNsaWVudFxuY29uc3QgY2xpZW50ID0gRHluYW1vREJEb2N1bWVudENsaWVudC5mcm9tKG5ldyBEeW5hbW9EQkNsaWVudCh7fSkpO1xuXG4vLyBIYXJkY29kZWQgdGFibGUgbmFtZXNcbmNvbnN0IFBST0RVQ1RTX1RBQkxFID0gJ1Byb2R1Y3RzVGFibGUnOyAvLyBSZXBsYWNlIHdpdGggeW91ciBhY3R1YWwgdGFibGUgbmFtZVxuY29uc3QgU1RPQ0tfVEFCTEUgPSAnU3RvY2tUYWJsZSc7IC8vIFJlcGxhY2Ugd2l0aCB5b3VyIGFjdHVhbCB0YWJsZSBuYW1lXG5cbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBhbnkpID0+IHtcbiAgLy8g4pyFIEhhbmRsZSBwcmVmbGlnaHQgT1BUSU9OUyByZXF1ZXN0XG4gIGlmIChldmVudC5odHRwTWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ1BPU1QsIE9QVElPTlMnLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxuICAgICAgfSxcbiAgICAgIGJvZHk6ICcnLFxuICAgIH07XG4gIH1cblxuICB0cnkge1xuICAgIC8vIFBhcnNlIHRoZSBib2R5IG9mIHRoZSByZXF1ZXN0XG4gICAgY29uc3QgYm9keSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSk7XG5cbiAgICAvLyBWYWxpZGF0ZSBpbnB1dFxuICAgIGlmIChcbiAgICAgICFib2R5LnRpdGxlIHx8XG4gICAgICB0eXBlb2YgYm9keS5wcmljZSAhPT0gJ251bWJlcicgfHxcbiAgICAgIHR5cGVvZiBib2R5LmNvdW50ICE9PSAnbnVtYmVyJ1xuICAgICkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ1BPU1QsIE9QVElPTlMnLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ0ludmFsaWQgcHJvZHVjdCBpbnB1dCcgfSksXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBwcm9kdWN0IElEIHVzaW5nIHV1aWRcbiAgICBjb25zdCBwcm9kdWN0SWQgPSB1dWlkdjQoKTtcblxuICAgIC8vIERlZmluZSB0aGUgcHJvZHVjdCBvYmplY3RcbiAgICBjb25zdCBwcm9kdWN0ID0ge1xuICAgICAgaWQ6IHByb2R1Y3RJZCxcbiAgICAgIHRpdGxlOiBib2R5LnRpdGxlLFxuICAgICAgZGVzY3JpcHRpb246IGJvZHkuZGVzY3JpcHRpb24gfHwgJycsXG4gICAgICBwcmljZTogYm9keS5wcmljZSxcbiAgICB9O1xuXG4gICAgLy8gRGVmaW5lIHRoZSBzdG9jayBvYmplY3RcbiAgICBjb25zdCBzdG9jayA9IHtcbiAgICAgIHByb2R1Y3RfaWQ6IHByb2R1Y3RJZCxcbiAgICAgIGNvdW50OiBib2R5LmNvdW50LFxuICAgIH07XG5cbiAgICAvLyBQdXQgdGhlIHByb2R1Y3QgaW50byBEeW5hbW9EQiBQUk9EVUNUU19UQUJMRVxuICAgIGF3YWl0IGNsaWVudC5zZW5kKG5ldyBQdXRDb21tYW5kKHsgVGFibGVOYW1lOiBQUk9EVUNUU19UQUJMRSwgSXRlbTogcHJvZHVjdCB9KSk7XG5cbiAgICAvLyBQdXQgdGhlIHN0b2NrIGludG8gRHluYW1vREIgU1RPQ0tfVEFCTEVcbiAgICBhd2FpdCBjbGllbnQuc2VuZChuZXcgUHV0Q29tbWFuZCh7IFRhYmxlTmFtZTogU1RPQ0tfVEFCTEUsIEl0ZW06IHN0b2NrIH0pKTtcblxuICAgIC8vIFJldHVybiB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSB3aXRoIHByb2R1Y3QgYW5kIHN0b2NrIGRldGFpbHNcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAxLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ1BPU1QsIE9QVElPTlMnLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgLi4ucHJvZHVjdCwgY291bnQ6IHN0b2NrLmNvdW50IH0pLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignQ3JlYXRlIHByb2R1Y3QgZXJyb3I6JywgZXJyb3IpO1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnUE9TVCwgT1BUSU9OUycsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZScsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyB9KSxcbiAgICB9O1xuICB9XG59O1xuIl19