export declare const handler: (event: any) => Promise<{
    statusCode: number;
    body: string;
    headers?: undefined;
} | {
    statusCode: number;
    headers: {
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Headers': string;
    };
    body: string;
}>;
