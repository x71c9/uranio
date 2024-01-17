/**
 *
 * Run module
 *
 * @packageDocumentation
 *
 */

// import {UranioMongoDBClient as MongoDBClient} from './uranio-client';

import {UranioMySQLClient as MySQLClient} from './client';

// import * as sql from './sql/index';

// const mongodb_uri = process.env.MONGODB_URI || '';
// const mongodb_name = process.env.MONGODB_NAME || '';

const mysql_uri = process.env.MYSQL_URI || '';
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

// type Pippo = {
//   _id: t.pro
// }

async function main(){
  // const query = sql.full.compose_select<Pippo>({table: 'pippo'});
  // // await mysql_urn.connect();
  // const [rows_00] = await mysql_urn.exe(query);
  // console.log(rows_00);
  // // await mysql_urn.disconnect();

  const response_00 = await mysql_urn.pippo.get_atoms({
    where: {
      // name: /jan/,
      age: {$nin: [35]}
    }
  });
  console.log(response_00);

  const query = 'SELECT * FROM `pippo` WHERE `age` IN (:x0000)';
  const map = {
    x0000: 35,
  }
  const response = await mysql_urn.exe(query, map);
  console.log(response);
}

main();
