# Uranio

![uranio logo](./img/LOGO_BANNER_01.png)

Uranio is a Typescript Object Document Mapper (ODM) for MongoDB.\
It creates a client for querying collections in a database by just parsing
the types in a repository.

## Install

```
yarn add uranio
```

## How it works

Run:
```
uranio generate
```

The above command search for all interfaces in your repository that extends
the `uranio.atom` interface.\
For each of these interfaces it creates a method to query a collection with a
name of the interface.

For example if in your code you have:

```typescript
import uranio from 'uranio';

interface Product extends uranio.atom {
  title: string;
  description: string;
  price: number;
}
```

then Uranio generates a method for querying a collection named `products`:

```typescript
import uranio from 'uranio';

const uri = process.env.MONGO_DATABASE_URI || '';
const db_name = process.env.MONGO_DATABASE_NAME || '';

const urn = uranio.Client({uri, db_name});

// Get all products
const products = await urn.products.find({});

// Create a product
await urn.products.put_item({
  title: 'Uranio mug',
  description: 'A radioactive mug for your coding breakfast',
  price: 4.99
});
```

### Uranio types

You can use uranio types to better define the schema of your collections.\
For example:

```typescript
interface Customer extends uranio.atom {
  email: uranio.unique<string>;
}
```

### Primary index `_id`

When extending an interface with `uranio.atom` this add a primary index
attribute `_id` to the interface, so there is no need to add it manually.

```typescript
import uranio from 'uranio';

interface Product extends uranio.atom {
  title: string;
  description: string;
  price: number;
}
// It resolves in:
// {
//  _id: string;
//  title: string;
//  description: string;
//  price: number;
// }
```



