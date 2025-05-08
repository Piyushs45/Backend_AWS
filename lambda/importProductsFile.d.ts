export declare function handler(event: any): Promise<{
    statusCode: number;
    body: string;
    headers: {
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Headers': string;
        'Access-Control-Allow-Methods': string;
    };
}>;
