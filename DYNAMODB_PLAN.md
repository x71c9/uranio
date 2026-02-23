# DynamoDB Support Plan

## Branch: `postgresql`

**Status**: Planning Phase
**Date**: 2025-02-23

## Goal

Add DynamoDB support to Uranio with a simplified, type-aware API that automatically infers attribute types from TypeScript interfaces.

## Desired API (User Experience)

### Simple Example

```typescript
import uranio from 'uranio';

// Define interface
interface Product extends uranio.atom {
  id: string;
  title: string;
  price: number;
}

// Initialize client
const urn = uranio.DynamoDBClient({ region: 'us-east-1' });

// Use simplified API - no need to specify attribute types!
await urn.products.getAtom({id: 'PROD-123'});
await urn.products.putAtom({id: 'PROD-123', title: 'Uranio Mug', price: 4.99});
await urn.products.updateAtom({id: 'PROD-123'}, {price: 5.99});
await urn.products.deleteAtom({id: 'PROD-123'});
```

### Composite Primary Key Example

```typescript
interface Order extends uranio.atom {
  userId: string;     // partition key
  orderId: string;    // sort key
  total: number;
}

// Get single order
await urn.orders.getAtom({userId: 'USER-1', orderId: 'ORD-100'});

// Get all orders for a user (partition key query)
await urn.orders.getAtomsByPartitionKey({userId: 'USER-1'});

// Update order
await urn.orders.updateAtom(
  {userId: 'USER-1', orderId: 'ORD-100'},
  {total: 99.99}
);
```

## Current State

### What Exists
- `.uranio/src/client/dynamodb.ts` - Basic DynamoDB client (only constructor)
- `.uranio/src/atom/dynamodb.ts` - Comprehensive atom client with low-level AWS SDK methods
- `.uranio/src/types/dynamodb.ts` - DynamoDB attribute types (`AttrType`, `AttrValue`)
- `.uranio/src/types/atom.ts` - `dynamodb_atom` interface
- `.uranio/src/client.ts` - `UranioDynamoDBClient` wrapper

### What's Missing
1. DynamoDB NOT in `DATABASE` enum (`src/cli/types.ts`)
2. No DynamoDB generation logic in `src/cli/generate/index.ts`
3. No README documentation for DynamoDB
4. Current atom client requires explicit type specification (`attribute_type: 'S'`)

### Current Low-Level API

The existing `DynamoDBAtomClient` requires verbose calls:

```typescript
// Current implementation requires explicit attribute types
await atom.getAtomByPrimaryIndex({
  attribute_name: 'id',
  attribute_type: 'S',      // ← User must specify this
  attribute_value: 'PROD-123'
});

await atom.getAtomByCompositePrimaryKey({
  partition_key_name: 'userId',
  partition_key_type: 'S',  // ← Manual type specification
  partition_key_value: 'USER-1',
  sort_key_name: 'orderId',
  sort_key_type: 'S',       // ← Manual type specification
  sort_key_value: 'ORD-100'
});
```

## Technical Approach

### 1. Type Inference at Generation Time

When `uranio generate -d dynamodb` runs:

1. **Parse interfaces** using Plutonio (already done for other databases)
2. **Detect primary key fields** from configuration
3. **Map TypeScript types to DynamoDB attribute types**:
   - `string` → `'S'`
   - `number` → `'N'`
   - `boolean` → `'BOOL'`
   - `string[]` → `'SS'` (String Set)
   - `number[]` → `'NS'` (Number Set)
   - `object` → `'M'` (Map)
   - Arrays of objects → `'L'` (List)

4. **Generate wrapper methods** with hardcoded type mappings

### Example Generated Code

For `interface Product extends uranio.atom { id: string; title: string; price: number }`:

```typescript
export class ProductAtomClient extends DynamoDBAtomClient<Product> {
  // Generated method that wraps the low-level API
  async getAtom(key: {id: string}): Promise<Product | null> {
    return this.getAtomByPrimaryIndex({
      attribute_name: 'id',
      attribute_type: 'S',  // ← Generated at compile time from 'id: string'
      attribute_value: key.id
    });
  }

  async putAtom(item: Product): Promise<any> {
    return super.putAtom(item); // Already works without types
  }

  async updateAtom(key: {id: string}, updates: Partial<Product>): Promise<any> {
    return this.updateAtomByPrimaryIndex({
      attribute_name: 'id',
      attribute_type: 'S',  // ← Generated
      attribute_value: key.id,
      item: updates
    });
  }

  async deleteAtom(key: {id: string}): Promise<any> {
    return this.deleteAtomByPrimaryIndex({
      attribute_name: 'id',
      attribute_type: 'S',  // ← Generated
      attribute_value: key.id
    });
  }
}
```

## Critical Decisions Needed

### Decision 1: How to Define Primary Keys?

DynamoDB requires explicit designation of partition key and optional sort key. Unlike MongoDB (auto `_id`) or SQL (schema-defined), we need to know which field(s) are keys.

#### Option A: Convention-Based (Simplest)

```typescript
// Always use 'id' as partition key (like MongoDB's _id)
interface Product extends uranio.atom {
  id: string;  // ← Assumed to be partition key by convention
  title: string;
}

// For composite keys, use 'id' + 'sortKey' convention
interface Order extends uranio.atom {
  id: string;      // ← Partition key
  sortKey: string; // ← Sort key
  total: number;
}
```

**Pros**: Simple, no configuration needed
**Cons**: Inflexible, forces naming convention

#### Option B: Configuration File (Flexible)

```yaml
# uranio.yml
database: dynamodb
naming_convention: camelCase

dynamodb:
  region: us-east-1
  table_prefix: "${ENV}_"  # Optional: dev_products, prod_products

  atoms:
    Product:
      partition_key: id

    Order:
      partition_key: userId
      sort_key: orderId

    User:
      partition_key: id
      global_secondary_indexes:
        - name: email-index
          partition_key: email
```

**Pros**: Flexible, supports any key structure
**Cons**: More configuration, another file to maintain

#### Option C: JSDoc Annotations (Middle Ground)

```typescript
interface Product extends uranio.atom {
  /** @dynamodb-partition-key */
  sku: string;
  title: string;
}

interface Order extends uranio.atom {
  /** @dynamodb-partition-key */
  userId: string;
  /** @dynamodb-sort-key */
  orderId: string;
  total: number;
}
```

**Pros**: Schema lives with code, no separate config
**Cons**: Requires custom JSDoc parser, non-standard

#### Recommendation: **Option B (Configuration)**

- Matches DynamoDB's inherent complexity
- Already have `uranio.yml` for database selection
- Supports advanced features (GSI, table naming)
- Clear separation of concerns

### Decision 2: Table Naming Strategy

Current `DynamoDBClient` constructor:
```typescript
export type DynamoDBClientParams = {
  region: string;
  tableName: string;  // ← Only ONE table!
};
```

But we have multiple atoms (products, orders, users). Each needs a DynamoDB table.

#### Option A: Table Prefix

```typescript
export type DynamoDBClientParams = {
  region: string;
  tablePrefix?: string;  // 'dev_' → 'dev_products', 'dev_orders'
};

// Usage
const urn = uranio.DynamoDBClient({
  region: 'us-east-1',
  tablePrefix: 'dev_'
});
// Queries 'dev_products' table
await urn.products.getAtom({id: '123'});
```

#### Option B: Table Name Mapping

```typescript
export type DynamoDBClientParams = {
  region: string;
  tableNames: {
    [atomName: string]: string;
  };
};

// Usage
const urn = uranio.DynamoDBClient({
  region: 'us-east-1',
  tableNames: {
    products: 'production-products-table',
    orders: 'production-orders-table'
  }
});
```

#### Option C: Derive from Atom Name

```typescript
// Simply use atom name as table name (with naming convention)
// Product → 'products', Order → 'orders'
const urn = uranio.DynamoDBClient({ region: 'us-east-1' });
await urn.products.getAtom({id: '123'}); // Queries 'products' table
```

#### Recommendation: **Option A (Table Prefix)**

- Simple and flexible
- Common pattern in cloud deployments (env prefixes)
- Can be optional (default: no prefix)

### Decision 3: Type Mapping for Edge Cases

Some TypeScript types don't map cleanly:

```typescript
interface Product extends uranio.atom {
  id: string;
  tags: string[];        // → 'SS' (String Set) or 'L' (List)?
  metadata: object;      // → 'M' (Map) - but loses type safety
  createdAt: Date;       // → DynamoDB has no Date type!
  price: number | null;  // → 'N' or 'NULL'? Needs runtime check
}
```

#### Type Mapping Rules

| TypeScript Type | DynamoDB Type | Notes |
|----------------|---------------|-------|
| `string` | `S` | String |
| `number` | `N` | Number (stored as string in DynamoDB) |
| `boolean` | `BOOL` | Boolean |
| `null` | `NULL` | Null |
| `string[]` | `SS` | String Set (homogeneous) |
| `number[]` | `NS` | Number Set (homogeneous) |
| `Array<T>` | `L` | List (heterogeneous) |
| `object` | `M` | Map |
| `Date` | **`N`** | **Convert to timestamp** |
| `T \| null` | Runtime | Check at runtime |

**Special Handling**:
- **Dates**: Auto-convert `Date` objects to Unix timestamps (numbers) when storing
- **Nullable types**: If value is `null`, use `NULL` type; otherwise use the type
- **Arrays**: Use `SS`/`NS` for primitive arrays, `L` for object arrays

### Decision 4: Global Secondary Indexes (GSI)

If schema config defines GSIs:

```yaml
atoms:
  User:
    partition_key: id
    global_secondary_indexes:
      - name: email-index
        partition_key: email
      - name: username-index
        partition_key: username
```

Generate convenience methods:

```typescript
export class UserAtomClient extends DynamoDBAtomClient<User> {
  // ... standard methods ...

  // Generated GSI methods
  async getByEmailIndex(email: string): Promise<User | null> {
    return this.getAtomByGlobalSecondaryIndex({
      index_name: 'email-index',
      attribute_name: 'email',
      attribute_type: 'S',
      attribute_value: email
    });
  }

  async getByUsernameIndex(username: string): Promise<User | null> {
    return this.getAtomByGlobalSecondaryIndex({
      index_name: 'username-index',
      attribute_name: 'username',
      attribute_type: 'S',
      attribute_value: username
    });
  }
}
```

## Implementation Plan

### Phase 1: Basic Support (No Config)
1. Add `DYNAMODB` to `DATABASE` enum
2. Generate basic client using convention:
   - Assume `id: string` as partition key
   - Table name = atom name (lowercase)
   - Generate simple wrapper methods
3. Update README with basic DynamoDB usage

### Phase 2: Configuration Support
1. Extend `uranio.yml` schema to support DynamoDB config
2. Parse DynamoDB schema definitions
3. Generate clients based on schema config
4. Support composite primary keys
5. Support table prefix

### Phase 3: Advanced Features
1. Global Secondary Index support
2. Date type auto-conversion
3. Better error messages
4. Validation (ensure partition key is included in putAtom, etc.)

## Open Questions

1. **Should we auto-generate partition key values (like MongoDB's _id)?**
   - DynamoDB doesn't support auto-generation
   - Could use UUID library to generate IDs if not provided
   - Pro: Easier for users
   - Con: Not standard DynamoDB practice

2. **How to handle getAtoms() without keys (scan operation)?**
   - Scans are expensive in DynamoDB
   - Should we:
     - Disallow it completely?
     - Allow but log warning?
     - Require explicit flag: `getAtoms({scan: true})`?

3. **Should we support batch operations?**
   - DynamoDB supports BatchGetItem, BatchWriteItem
   - `putAtoms([...])` could use BatchWriteItem
   - Would require additional code generation

4. **How to handle consistent reads?**
   - DynamoDB has eventual consistency by default
   - Strongly consistent reads cost more
   - Could add option: `getAtom({id: '123'}, {consistentRead: true})`

5. **Should we validate that the DynamoDB table schema matches the interface?**
   - At runtime, check that partition key exists in table
   - Warn if interface has fields not in table schema
   - Requires AWS SDK calls at initialization time

## Next Steps

1. **Decide on configuration approach** (recommend Option B - Configuration File)
2. **Create minimal implementation** (Phase 1) to validate approach
3. **Test with real DynamoDB** (LocalStack or AWS)
4. **Iterate based on learnings**

## Files to Modify

### CLI Generation
- `src/cli/types.ts` - Add DYNAMODB to enum
- `src/cli/generate/index.ts` - Add DynamoDB generation functions
- `src/cli/init/index.ts` - Already includes dynamodb in prompts (verify)

### Generated Code
- `.uranio/src/client/dynamodb.ts` - Update constructor params (table prefix)
- `.uranio/src/atom/dynamodb.ts` - Already exists (keep low-level API)
- Generate new wrapper atom clients per interface

### Documentation
- `README.md` - Add DynamoDB section

## Risks and Concerns

1. **Complexity creep**: DynamoDB's flexibility might force too much configuration
2. **Schema drift**: DynamoDB table schema might not match TypeScript interfaces
3. **Performance**: Generated wrappers add another layer of abstraction
4. **Testing**: Requires actual DynamoDB instance (or LocalStack)
5. **Migration**: Users migrating from other databases might expect SQL-like behavior

## Success Criteria

1. User can define a simple interface and query DynamoDB without knowing attribute types
2. Configuration is minimal for simple cases, powerful for complex cases
3. Generated code is readable and debuggable
4. API feels consistent with MySQL/PostgreSQL/MongoDB clients
5. Documentation is clear with working examples
