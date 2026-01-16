# Uranio

![uranio logo](./img/uranio_logo_1440x220.png)

Uranio is the lightest Typescript Object Document Mapper (ODM) for MongoDB and
Object Relational Mapping (ORM) for MySQL.\
It creates a client for querying collections/tables in a database by just parsing
the types in a repository.

It is the simplest and fastest way to query a database without the need to build
a Data Access Layer (DAL) from the defined types.

## Install

```
npm install uranio
```

## How it works

Run:
```bash
uranio generate -d mongodb
// or
uranio generate -d mysql
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

const urn = uranio.MongoDBClient({uri, db_name});

// Get all products
const products = await urn.products.get_atoms({});

// Create a product
await urn.products.put_atom({
  title: 'Uranio mug',
  description: 'A radioactive mug for your coding breakfast',
  price: 4.99
});
```

### Primary index `_id` for MongoDB

When extending an interface with `uranio.atom` (MongoDB) this add a primary
index attribute `_id` to the interface, so there is no need to add it manually.

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

## Configuration

### MySQL Client Options

When creating a MySQL client, you can configure additional options:

```typescript
import uranio from 'uranio';

const uri = process.env.MYSQL_DATABASE_URI || '';

// Default: UTC timezone, no connection pool
const urn = uranio.MySQLClient({ uri });

// With connection pool
const urn = uranio.MySQLClient({
  uri,
  use_pool: true
});

// Custom timezone (default is UTC '+00:00')
const urn = uranio.MySQLClient({
  uri,
  use_pool: true,
  timezone: '+04:00'  // Dubai timezone (GST)
});

// Use local server timezone
const urn = uranio.MySQLClient({
  uri,
  timezone: 'local'
});
```

**Timezone Parameter:**
- **Default**: `'+00:00'` (UTC) - All dates are stored in UTC
- **Custom**: Any valid timezone offset like `'+04:00'` (Dubai), `'+09:00'` (Tokyo)
- **Local**: `'local'` - Uses the database server's timezone

The timezone setting affects how JavaScript `Date` objects are converted when storing to and retrieving from the database. Using UTC (default) is recommended for consistency across different timezones.

### Credits

Logo credits [https://www.jacopotripodi.com/](https://www.jacopotripodi.com/)

