# Uranio Test Suite

Comprehensive unit tests for the Uranio Data Access Layer.

## Test Coverage

**Overall Coverage: 97.26%**

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| sql/full_query.ts | 96.66% | 93.65% | 100% | 96.57% |
| sql/param_query.ts | 98.07% | 92% | 100% | 98.05% |
| types/sql.ts | 100% | 100% | 100% | 100% |

## Running Tests

```bash
# Run all tests
npm run test:jest

# Run tests in watch mode
npm run test:jest:watch

# Run tests with coverage report
npm run test:jest:coverage

# Run only unit tests
npm run test:jest -- --testPathPatterns="tests/unit"
```

## Test Structure

```
tests/
├── unit/
│   └── sql/
│       ├── full_query.test.ts                    # SQL query generation tests (55 tests)
│       ├── param_query_comprehensive.test.ts     # Parameterized queries (48 tests)
│       └── value_formatting.test.ts              # Security & edge cases (29 tests)
└── README.md
```

## Test Categories

### 1. SQL Full Query Tests (`full_query.test.ts`)
Tests pure SQL query generation without database connections.

**Covered Areas:**
- Basic SELECT queries (projection, WHERE, multiple conditions)
- Comparison operators ($eq, $gt, $gte, $lt, $lte, $ne)
- Array operators ($in, $nin)
- Existence checks ($exists)
- RegExp pattern matching
- Logical operators ($and, $or, $nor)
- ORDER BY clause with validation
- LIMIT clause with security checks
- UPDATE queries
- DELETE queries
- INSERT queries (single and batch)
- Date handling
- Edge cases and error conditions

### 2. Parameterized Query Tests (`param_query_comprehensive.test.ts`)
Tests SQL injection prevention through parameterization.

**Covered Areas:**
- Parameter generation for all value types
- WHERE clause parameterization
- Comparison operator parameterization
- Array value expansion to individual parameters
- RegExp source extraction and parameterization
- Date object parameterization
- Logical operator parameter handling
- UPDATE/DELETE/INSERT parameterization
- Parameter ID uniqueness and consistency
- Complex nested query parameterization
- Special value handling (zero, negative, empty strings)

### 3. Value Formatting & Security Tests (`value_formatting.test.ts`)
Tests security features and edge case handling.

**Covered Areas:**
- SQL injection prevention (quotes, DROP TABLE, SQL keywords)
- ORDER BY column name validation
- LIMIT clause validation
- Special character handling (newlines, tabs, backslashes, unicode, emojis)
- Edge case values (empty strings, very long strings, negative numbers, zero, floats)
- Array value formatting (empty, single element, mixed types)
- Date placeholder generation
- RegExp extraction and parameterization
- Boolean value formatting
- Error handling for invalid inputs

## Test Philosophy

### No Database Required
All Phase 1 tests are **pure unit tests** that don't require database connections:
- Fast execution (< 7 seconds for full suite)
- No infrastructure dependencies
- Can run in CI/CD without Docker/database setup
- Predictable and deterministic results

### High Coverage Focus
Tests focus on the most critical code paths:
- SQL query generation logic (core functionality)
- SQL injection prevention (security)
- Type handling and conversions (reliability)
- Edge cases and error conditions (robustness)

### Testing Strategy
1. **Positive tests**: Verify correct behavior with valid inputs
2. **Negative tests**: Ensure proper error handling with invalid inputs
3. **Security tests**: Validate SQL injection prevention
4. **Edge case tests**: Handle boundary conditions and special values

## Key Security Tests

The test suite includes comprehensive security validation:

1. **SQL Injection Prevention**
   - Dangerous strings with quotes and SQL keywords
   - ORDER BY column name validation (alphanumeric + underscore only)
   - LIMIT clause validation (numeric only)
   - Parameterized query safety

2. **Input Validation**
   - Column names must match: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`
   - ORDER BY directions: only "asc" or "desc"
   - LIMIT format: `"number"`, `"limit,offset"`, or `"limit OFFSET offset"`

3. **Safe Value Handling**
   - String escaping for quotes
   - Special character preservation
   - Unicode and emoji support
   - Date placeholder generation

## Coverage Report Details

### Uncovered Lines (2.74%)
The following lines are not covered by tests:

**full_query.ts:**
- Line 91: Edge case in WHERE resolution
- Line 123: $nor operator edge case
- Line 300-303: $not operator recursive case
- Line 314: Invalid filter operator error path

**param_query.ts:**
- Line 158: Root operator validation edge case
- Line 180: Filter operator edge case

These represent uncommon error paths and defensive code that would require intentional invalid input.

## Future Test Expansion

### Phase 2: Mock-Based Client Tests (Not Implemented)
Would test database client integration with mocked connections:
- MongoDB atom client methods
- PostgreSQL atom client methods
- MySQL atom client methods
- Connection pooling logic
- Error handling and retries

### Phase 3: Integration Tests (Not Implemented)
Would require real database instances:
- End-to-end CRUD operations
- Transaction handling
- Connection pooling under load
- Database-specific edge cases

## Contributing

When adding new features to the SQL query builders:

1. Add tests to the appropriate test file
2. Ensure both positive and negative test cases
3. Run coverage to ensure new code is tested
4. Aim for >95% coverage on new code
5. Include security tests for user-facing inputs

## Test Examples

### Example: Testing SQL Generation
```typescript
it('should generate SELECT with WHERE clause', () => {
  const query = full.compose_select<User>({
    table: 'users',
    where: { age: { $gte: 18 } },
  });

  expect(query).toBe('SELECT * FROM `users` WHERE `age` >= 18');
});
```

### Example: Testing Parameterization
```typescript
it('should parameterize dangerous strings', () => {
  const result = param.compose_select<User>({
    table: 'users',
    where: { name: "'; DROP TABLE users;--" },
  });

  expect(result.query).not.toContain('DROP TABLE');
  expect(Object.values(result.map)).toContain("'; DROP TABLE users;--");
});
```

### Example: Testing Security
```typescript
it('should reject invalid column names', () => {
  expect(() => {
    full.compose_select<User>({
      table: 'users',
      order: { 'name; DROP TABLE users;--': 'asc' } as any,
    });
  }).toThrow(/Invalid column name/);
});
```
