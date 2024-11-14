"use strict";
/**
 *
 * DynamoDB Atom client module
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBAtomWithCompositePrimaryKeyClient = exports.DynamoDBAtomWithIdClient = exports.DynamoDBAtomClient = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
class DynamoDBAtomClient {
    constructor(client, name) {
        this.client = client;
        this.name = name;
    }
    async get_atom_by_primary_index({ attribute_name, attribute_type, attribute_value, }) {
        const params = {
            TableName: this.name,
            Key: {
                [attribute_name]: { [attribute_type]: attribute_value },
            },
        };
        // log.trace(`GET ITEM BY PRIMARY INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.GetItemCommand(params);
        const response = await this.client.send(command);
        // log.trace(`GET ITEM BY PRIMARY INDEX RESPONSE: `, response);
        if (!response.Item) {
            return null;
        }
        const unmarshalled = (0, util_dynamodb_1.unmarshall)(response.Item);
        return unmarshalled;
    }
    async get_atom_by_global_secondary_index({ index_name, attribute_name, attribute_type, attribute_value, }) {
        const params = {
            TableName: this.name,
            IndexName: index_name,
            KeyConditionExpression: `${attribute_name} = :value`,
            ExpressionAttributeValues: {
                ':value': { [attribute_type]: attribute_value },
            },
        };
        // log.trace(`GET ITEM BY GLOBAL SECONDARY INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.QueryCommand(params);
        const response = await this.client.send(command);
        // log.trace(`GET ITEM BY GLOBAL SECONDARY INDEX RESPONSE: `, response);
        if (!response.Items || !Array.isArray(response.Items)) {
            throw new Error(`Invalid QueryCommand response`);
        }
        if (response.Items.length === 0) {
            return null;
        }
        const unmarshalled = (0, util_dynamodb_1.unmarshall)(response.Items[0]);
        return unmarshalled;
    }
    async put_atom(shape) {
        const dynamo_item = {};
        for (const [key, value] of Object.entries(shape)) {
            switch (typeof value) {
                case 'string':
                    dynamo_item[key] = { S: value };
                    break;
                case 'number':
                    dynamo_item[key] = { N: value.toString() };
                    break;
                case 'boolean':
                    dynamo_item[key] = { BOOL: value };
                    break;
                default:
                    throw new Error(`Unsupported attribute type '${typeof value}' for` +
                        ` attribute name '${key}'`);
            }
        }
        const params = {
            TableName: this.name,
            Item: dynamo_item,
        };
        // log.trace(`PUT PARAMS: `, params);
        const putItemCommand = new client_dynamodb_1.PutItemCommand(params);
        const response = await this.client.send(putItemCommand);
        // log.trace(`PUT RESPONSE: `, response);
        return response;
    }
    async update_atom_by_primary_index({ attribute_name, attribute_type, attribute_value, item, }) {
        const updateExpression = Object.keys(item)
            .map((key) => `SET ${key} = :${key}`)
            .join(', ');
        const params = {
            TableName: this.name,
            Key: {
                [attribute_name]: {
                    [attribute_type]: attribute_value,
                },
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: Object.entries(item).reduce((acc, [key, value]) => ({
                ...acc,
                [`:${key}`]: { [_dynamo_attribute_type_for(key, value)]: value },
            }), {}),
        };
        // log.trace(`UPDATE BY PRIMARY INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.UpdateItemCommand(params);
        const respone = await this.client.send(command);
        // log.trace(`UPDATE BY PRIMARY INDEX RESPONSE: `, respone);
        return respone;
    }
    async delete_atom_by_primary_index({ attribute_name, attribute_type, attribute_value, }) {
        const params = {
            TableName: this.name,
            Key: {
                [attribute_name]: { [attribute_type]: attribute_value },
            },
        };
        // log.trace(`DELETE BY PRIMARY INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.DeleteItemCommand(params);
        const response = await this.client.send(command);
        // log.trace(`DELETE BY PRIMARY INDEX RESPONSE: `, params);
        return response;
    }
    async is_primary_index_value_unique({ attribute_name, attribute_type, attribute_value, }) {
        const item = await this.get_atom_by_primary_index({
            attribute_name,
            attribute_type,
            attribute_value,
        });
        if (item !== null) {
            return false;
        }
        return true;
    }
    async is_secondary_global_index_value_unique({ index_name, attribute_name, attribute_type, attribute_value, }) {
        const item = await this.get_atom_by_global_secondary_index({
            index_name,
            attribute_name,
            attribute_type,
            attribute_value,
        });
        if (item !== null) {
            return false;
        }
        return true;
    }
    async get_by_partition_key({ attribute_name, attribute_type, attribute_value, }) {
        const params = {
            TableName: this.name,
            KeyConditionExpression: `${attribute_name} = :pk`,
            ExpressionAttributeValues: {
                ':pk': { [attribute_type]: attribute_value },
            },
            ScanIndexForward: true, // Set to true for ascending order, false for descending order
        };
        // log.trace(`GET BY PARTITION KEY PARAMS: `, params);
        const command = new client_dynamodb_1.QueryCommand(params);
        const response = await this.client.send(command);
        // log.trace(`GET BY PARTITION KEY RESPONSE: `, response);
        if (!response.Items) {
            return [];
        }
        const response_items = [];
        for (const item of response.Items) {
            const unmarshalled = (0, util_dynamodb_1.unmarshall)(item);
            response_items.push(unmarshalled);
        }
        return response_items;
    }
}
exports.DynamoDBAtomClient = DynamoDBAtomClient;
class DynamoDBAtomWithIdClient extends DynamoDBAtomClient {
    async get_atom_by_id(id) {
        return this.get_atom_by_primary_index({
            attribute_name: 'id',
            attribute_value: id,
            attribute_type: 'S',
        });
    }
    async update_atom_by_id(id, item) {
        return this.update_atom_by_primary_index({
            attribute_name: 'id',
            attribute_value: id,
            attribute_type: 'S',
            item,
        });
    }
    async delete_by_id(id) {
        return this.delete_atom_by_primary_index({
            attribute_name: 'id',
            attribute_value: id,
            attribute_type: 'S',
        });
    }
    async is_id_unique(id) {
        return await this.is_primary_index_value_unique({
            attribute_name: 'id',
            attribute_type: 'S',
            attribute_value: id,
        });
    }
}
exports.DynamoDBAtomWithIdClient = DynamoDBAtomWithIdClient;
class DynamoDBAtomWithCompositePrimaryKeyClient extends DynamoDBAtomClient {
    async get_atom_by_composite_primary_key({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, }) {
        const params = {
            TableName: this.name,
            Key: {
                [partition_key_name]: {
                    [partition_key_type]: partition_key_value,
                },
                [sort_key_name]: {
                    [sort_key_type]: sort_key_value,
                },
            },
        };
        // log.trace(`GET BY COMPOSITE KEY PARAMS: `, params);
        const command = new client_dynamodb_1.GetItemCommand(params);
        const response = await this.client.send(command);
        // log.trace(`GET BY COMPOSITE KEY RESPONSE: `, response);
        if (!response.Item) {
            return null;
        }
        const item = response.Item;
        const unmarshalled = (0, util_dynamodb_1.unmarshall)(item);
        return unmarshalled;
    }
    async update_by_composite_primary_index({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, item, }) {
        const updateExpression = Object.keys(item)
            .map((key) => `SET ${key} = :${key}`)
            .join(', ');
        const params = {
            TableName: this.name,
            Key: {
                [partition_key_name]: {
                    [partition_key_type]: partition_key_value,
                },
                [sort_key_name]: {
                    [sort_key_type]: sort_key_value,
                },
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: Object.entries(item).reduce((acc, [key, value]) => ({
                ...acc,
                [`:${key}`]: { [_dynamo_attribute_type_for(key, value)]: value },
            }), {}),
        };
        // log.trace(`UPDATE BY COMPOSITE PRIMARY INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.UpdateItemCommand(params);
        const respone = await this.client.send(command);
        // log.trace(`UPDATE BY COMPOSITE PRIMARY INDEX RESPONSE: `, respone);
        return respone;
    }
    async delete_by_composite_key({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, }) {
        const params = {
            TableName: this.name,
            Key: {
                [partition_key_name]: { [partition_key_type]: partition_key_value },
                [sort_key_name]: { [sort_key_type]: sort_key_value },
            },
        };
        // log.trace(`DELETE BY COMPOSITE INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.DeleteItemCommand(params);
        const response = await this.client.send(command);
        // log.trace(`DELETE BY COMPOSITE INDEX RESPONSE: `, response);
        return response;
    }
}
exports.DynamoDBAtomWithCompositePrimaryKeyClient = DynamoDBAtomWithCompositePrimaryKeyClient;
function _dynamo_attribute_type_for(name, value) {
    switch (typeof value) {
        case 'string': {
            return 'S';
        }
        case 'number': {
            return 'N';
        }
        case 'boolean': {
            return 'B';
        }
    }
    throw new Error(`Attribute type not supported. Attribute name '${name}'` +
        ` , attribute type '${typeof value}'`);
}
//# sourceMappingURL=dynamodb.js.map