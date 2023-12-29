/**
 *
 * UranioClient module
 *
 * @packageDocumentation
 *
 */

import {Client, ClientParams} from './client';
import {Atom} from './types';
import {AtomClient} from './atom';

interface Product extends Atom {
  title: string;
  price: number;
}

export class UranioClient extends Client{
  public product: AtomClient<Product>;
  constructor(params: ClientParams) {
    super(params);
    this.product = new AtomClient<Product>(this.db, 'product');
  }
}

