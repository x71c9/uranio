/**
 *
 * Run module
 *
 * @packageDocumentation
 *
 */

// import {UranioMongoDBClient as MongoDBClient} from './uranio-client';

import {UranioMySQLClient as MySQLClient} from './uranio-client';

import {generate_sql} from './converter';

// const mongodb_uri = process.env.MONGODB_URI || '';
// const mongodb_name = process.env.MONGODB_NAME || '';

const mysql_uri = process.env.MYSQL_URI || '';
console.log(mysql_uri);
// const mysql_name = process.env.MONGODB_NAME || '';

// const mongo_urn = new MongoDBClient({
//   uri: mongodb_uri,
//   db_name: mongodb_name
// });

// mongo_urn.connect();
// mongo_urn.disconnect();

const mysql_urn = new MySQLClient({
  uri: mysql_uri,
  use_pool: true
});

// mysql_urn.get_pool_connection().then((connection) => {
//   console.log(connection);
// });

async function main(){
  const sql = 'SELECT * FROM pippo';
  // await mysql_urn.connect();
  const [rows_00] = await mysql_urn.exe(sql, {k: 0, b: 'a'});
  console.log(rows_00);
  // await mysql_urn.disconnect();

}

main();


type Foo = {
  _id: string
  foo: number
  boo: string
}

const query = generate_sql<Foo>({
  type: 'select',
  projection: ['*'],
  table: 'uranio-table',
  query: {foo: {$gt: 2, $lte: 100}, boo: '123'},
  order: {creation_date: 'desc'},
  limit: 10
});
console.log(query);
console.log('............................................................');
const query_b = generate_sql<Foo>({
  type: 'select',
  projection: ['*'],
  table: 'uranio-table',
  query: {$and: [{foo: {$gt: 2}}, {foo: {$lte: 100}}, {boo: '123'}]},
  order: {creation_date: 'desc'},
  limit: 10
});
console.log(query_b);
console.log('............................................................');
const query_c = generate_sql<Foo>({
  type: 'select',
  projection: ['*'],
  table: 'uranio-table',
  query: {$or: [{boo: 'a'}, {boo: {$in: ['1','2','3']}}]},
  order: {creation_date: 'desc'},
  limit: 10
});
console.log(query_c);
console.log('............................................................');
const query_d = generate_sql<Foo>({
  type: 'select',
  projection: ['*'],
  table: 'uranio-table',
  query: {
    $or: [
      {boo: 'a'},
      {boo: {$in: ['1','2','3']}},
      {
        $and: [
          {foo: 2},{foo: 1}
        ]
      },
    ]
  },
  order: {creation_date: 'desc'},
  limit: 10
});
console.log(query_d);
console.log('............................................................');
