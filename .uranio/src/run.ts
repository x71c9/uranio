/**
 *
 * Run module
 *
 * @packageDocumentation
 *
 */

// import {UranioMongoDBClient as MongoDBClient} from './uranio-client';

import {UranioMySQLClient as MySQLClient} from './uranio-client';

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
