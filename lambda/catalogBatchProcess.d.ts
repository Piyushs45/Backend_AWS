import { SQSEvent, Context } from 'aws-lambda';
export declare const handler: (event: SQSEvent, context: Context) => Promise<{
    statusCode: number;
    body: string;
}>;
