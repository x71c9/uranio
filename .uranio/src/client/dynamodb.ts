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
  table_name: string;
};

export class DynamoDBClient{
  protected client: AWSDynamoDBClient;
  public table_name: string;
  constructor(params: DynamoDBClientParams) {
    this.client = new AWSDynamoDBClient({region: params.region});
    this.table_name = params.table_name;
  }
}
