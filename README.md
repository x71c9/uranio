# Uranio

![uranio logo](./img/uranio_logo_1440x220.png)

Uranio is the lightest Typescript Object Document Mapper (ODM) for MongoDB,
Object Relational Mapping (ORM) for MySQL and PostgreSQL, and DynamoDB.\
It creates a client for querying collections/tables in a database by just parsing
the types in a repository.

It is the simplest and fastest way to query a database without the need to build
a Data Access Layer (DAL) from the defined types.

## Install

Uranio uses peer dependencies for database SDKs, so you only install what you need:

### For MongoDB users:
```bash
npm install uranio mongodb
```

### For MySQL users:
```bash
npm install uranio mysql2
```

### For PostgreSQL users:
```bash
npm install uranio pg
npm install --save-dev @types/pg
```

### For DynamoDB users:
```bash
npm install uranio @aws-sdk/client-dynamodb @aws-sdk/util-dynamodb
```

## How it works

Run:
```bash
uranio generate -d mongodb
// or
uranio generate -d mysql
// or
uranio generate -d postgresql
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
const dbName = process.env.MONGO_DATABASE_NAME || '';

const urn = uranio.MongoDBClient({uri, dbName});

// Get all products
const products = await urn.products.getAtoms({});

// Create a product
await urn.products.putAtom({
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
  usePool: true
});

// Custom timezone (default is UTC '+00:00')
const urn = uranio.MySQLClient({
  uri,
  usePool: true,
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

### PostgreSQL Client Options

When creating a PostgreSQL client, you can configure additional options:

```typescript
import uranio from 'uranio';

const uri = process.env.POSTGRESQL_DATABASE_URI || '';

// Default: no connection pool
const urn = uranio.PostgreSQLClient({ uri });

// With connection pool (recommended for production)
const urn = uranio.PostgreSQLClient({
  uri,
  usePool: true
});
```

**Connection Pool:**
- Connection pooling is recommended for production environments to manage database connections efficiently
- PostgreSQL handles timezones natively, so no timezone configuration is needed

## Troubleshooting

### Missing Database SDK Error

If you get an error like:
```
Error: Cannot find module 'mongodb'
Error: Cannot find module 'mysql2'
Error: Cannot find module 'pg'
Error: Cannot find module '@aws-sdk/client-dynamodb'
```

This means you haven't installed the required database SDK. Install the SDK for your chosen database:

```bash
# For MongoDB
npm install mongodb

# For MySQL
npm install mysql2

# For PostgreSQL
npm install pg
npm install --save-dev @types/pg

# For DynamoDB
npm install @aws-sdk/client-dynamodb @aws-sdk/util-dynamodb
```

### Peer Dependency Warnings

When installing Uranio, npm may show peer dependency warnings. These are expected since Uranio supports multiple databases. You only need to install the SDK for the database you're actually using.

### Credits

Logo credits [https://www.jacopotripodi.com/](https://www.jacopotripodi.com/)

