import urn from '.uranio/client';
export default urn;

/**
 *
 * Uranio client
 *
 * @packageDocumentation
 *
 */

// import {MongoClient, ServerApiVersion} from 'mongodb';

// interface UranioAtom {
//   _id: string
// }

// interface UranioProduct extends UranioAtom{
//   title: string
//   price: number
// }

// type Query<A extends UranioAtom> = {
//   a?: A
// }

// class Atom<A extends UranioAtom> {
//   public async find(query: Query<A>): Promise<void>{
//     console.log('Finding...', query);
//   }
// }

// class Product extends Atom<UranioProduct> {
// }
// Product

// const uranio_client = {
//   product: {
    
//   },
//   hello: '',
//   async connect(){
//     const uri = process.env.DATABASE_URI || '';
//     const client = new MongoClient(uri,  {
//       serverApi: {
//           version: ServerApiVersion.v1,
//           strict: true,
//           deprecationErrors: true,
//         }
//       }
//     );
//     await client.connect();
//     console.log('Connected');
//   }
// }

// export default uranio_client

