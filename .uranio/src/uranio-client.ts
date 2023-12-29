/**
 *
 * UranioClient module
 *
 * @packageDocumentation
 *
 */

import {Client, ClientParams} from './client';
// import {AtomClient} from './atom';
// import {atom} from './types';

// interface Product extends atom {
//   title: string;
//   price: number;
// }

export class UranioClient extends Client{
  // public product: AtomClient<Product>;
  constructor(params: ClientParams) {
    super(params);
    // this.product = new AtomClient<Product>(this.db, 'product');
  }
}

