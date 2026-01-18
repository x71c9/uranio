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
    tableName: string;
};
export declare class DynamoDBClient {
    protected client: AWSDynamoDBClient;
    tableName: string;
    constructor(params: DynamoDBClientParams);
}
