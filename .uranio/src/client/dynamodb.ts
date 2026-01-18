/**
 *
 * DynamoDB Client module
 *
 * @packageDocumentation
 *
 */

import {
  DynamoDBClient as AWSDynamoDBClient,
} from '@aws-sdk/client-dynamodb';

export type DynamoDBClientParams = {
  region: string;
  tableName: string;
};

export class DynamoDBClient{
  protected client: AWSDynamoDBClient;
  public tableName: string;
  constructor(params: DynamoDBClientParams) {
    this.client = new AWSDynamoDBClient({region: params.region});
    this.tableName = params.tableName;
  }
}
