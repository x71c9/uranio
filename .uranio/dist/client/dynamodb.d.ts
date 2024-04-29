/**
 *
 * DynamoDB Client module
 *
 * @packageDocumentation
 *
 */
import { DynamoDBClient as AWSDynamoDBClient } from '@aws-sdk/client-dynamodb';
export type DynamoDBClientParams = {
    region: string;
    table_name: string;
};
export declare class DynamoDBClient {
    protected client: AWSDynamoDBClient;
    table_name: string;
    constructor(params: DynamoDBClientParams);
}
