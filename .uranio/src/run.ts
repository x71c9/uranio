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
  // db_name: mysql_name
});

// mysql_urn.get_pool_connection().then((connection) => {
//   console.log(connection);
// });

async function main(){
  await mysql_urn.connect();
  const respnose = await mysql_urn.exe('SELECT * FROM api_error', {});
  console.log(respnose);
}

main();
