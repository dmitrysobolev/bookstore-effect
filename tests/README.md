# Testing Guide

This directory contains all tests and testing utilities for the Bookstore Management API.

## Directory Structure

```
tests/
├── README.md              # This file - testing documentation
├── unit/                  # Unit tests (isolated component testing)
├── integration/           # Integration tests (API endpoint testing)
├── fixtures/              # Test data and mock objects
├── helpers/               # Testing utilities and helper functions
└── scripts/               # Test automation scripts
    ├── runner.sh          # Main test runner
    ├── comprehensive.sh   # Full API test suite
    ├── simple.sh          # Basic manual testing
    └── original-test.sh   # Legacy test script
```

## Running Tests

### Quick Start

```bash
# Run all tests (unit + integration)
npm test

# Run only integration tests (API testing)
npm run test:integration

# Run comprehensive test suite
npm run test:full

# Run simple manual tests
npm run test:simple

# Check MongoDB health
npm run test:health
```

### Individual Test Scripts

From the project root:

```bash
# Smoke tests (quick validation)
cd tests/scripts && ./runner.sh --smoke

# Full comprehensive tests
cd tests/scripts && ./runner.sh --full

# Manual step-by-step testing
cd tests/scripts && ./simple.sh

# MongoDB health check
node tests/helpers/mongodb-health.js
```

## Test Types

### 1. Unit Tests (`tests/unit/`)
- **Purpose**: Test individual functions and classes in isolation
- **Framework**: Not yet implemented (recommended: Jest or Vitest)
- **Scope**: Models, services, repositories
- **Speed**: Very fast (< 1s)

**Example unit tests to implement:**
- Book model validation
- Author service business logic
- Repository data access methods
- Schema validation functions

### 2. Integration Tests (`tests/integration/`)
- **Purpose**: Test API endpoints and database interactions
- **Current**: Implemented via shell scripts
- **Scope**: HTTP endpoints, database operations, service interactions
- **Speed**: Medium (5-30s)

**Current integration tests:**
- Author CRUD operations
- Book CRUD operations
- Search functionality
- Data validation
- Error handling
- Relationship integrity

### 3. Test Scripts (`tests/scripts/`)
- **Purpose**: Automated test execution and manual testing
- **Implementation**: Bash scripts with curl and API calls
- **Use case**: CI/CD, manual validation, debugging

## Prerequisites

### Required Software
- Node.js (v18+)
- MongoDB (running locally or remote)
- curl (for API testing)
- jq (for JSON parsing)

### Installation
```bash
# Install jq (if not already installed)
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Verify MongoDB is running
npm run test:health
```

## Test Data Management

### Fixtures (`tests/fixtures/`)
- Sample authors and books for testing
- Mock data for various scenarios
- Database seed files

### Data Cleanup
- Tests automatically clean up created data
- Use `CTRL+C` to interrupt tests safely
- Manual cleanup via DELETE endpoints if needed

## Test Configuration

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017  # MongoDB connection
DB_NAME=bookstore                      # Database name
PORT=3000                             # Server port
```

### Test Database
- Tests use the same database as development by default
- Consider using a separate test database for isolation
- Data is cleaned up after each test run

## Writing New Tests

### Adding Unit Tests (Recommended)

1. Install a testing framework:
```bash
npm install --save-dev jest @types/jest
# or
npm install --save-dev vitest
```

2. Create test files in `tests/unit/`:
```javascript
// tests/unit/book.test.ts
import { Book } from '../../src/models/book';

describe('Book Model', () => {
  test('should validate required fields', () => {
    // Test implementation
  });
});
```

### Adding Integration Tests

1. Create API test files in `tests/integration/`:
```typescript
// tests/integration/authors.test.ts
import request from 'supertest';
import { app } from '../../src/app';

describe('Authors API', () => {
  test('GET /api/authors should return empty array initially', async () => {
    const response = await request(app).get('/api/authors');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
```

### Adding Test Scripts

1. Create new scripts in `tests/scripts/`:
```bash
#!/bin/bash
# tests/scripts/performance.sh
# Performance testing script
```

2. Update `package.json` to include new script:
```json
{
  "scripts": {
    "test:performance": "cd tests/scripts && ./performance.sh"
  }
}
```

## Test Scenarios Covered

### Author Management
- ✅ Create author with required fields
- ✅ Create author with optional fields
- ✅ Prevent duplicate author names
- ✅ Search authors by name/biography/nationality
- ✅ Update author information
- ✅ Delete author
- ✅ Get authors by nationality
- ✅ Validate author data integrity

### Book Management
- ✅ Create book with valid author references
- ✅ Prevent duplicate ISBN
- ✅ Validate author existence before book creation
- ✅ Search books by title/genre/author
- ✅ Update book information
- ✅ Update book stock levels
- ✅ Delete book
- ✅ Get books by genre/author

### Relationship Testing
- ✅ Books reference existing authors
- ✅ Multi-author books
- ✅ Populated author details in book responses
- ✅ Data integrity on author deletion

### Error Handling
- ✅ Invalid JSON payloads
- ✅ Missing required fields
- ✅ Non-existent resource access
- ✅ Duplicate data prevention
- ✅ Invalid data types
- ✅ Business rule violations

### Performance Testing
- ✅ Bulk data creation (5 authors, 10 books)
- ✅ Large dataset retrieval
- ✅ Complex query performance
- ✅ Concurrent request handling

## Continuous Integration

### GitHub Actions (Recommended)
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:8.0
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:health
      - run: npm test
```

## Troubleshooting

### Common Issues

1. **MongoDB not running**
   ```bash
   # Start MongoDB
   brew services start mongodb/brew/mongodb-community
   # or
   sudo service mongod start
   ```

2. **Port 3000 in use**
   ```bash
   # Find and kill process
   lsof -i :3000
   kill <PID>
   ```

3. **jq not installed**
   ```bash
   # Install jq for JSON parsing
   brew install jq  # macOS
   sudo apt-get install jq  # Ubuntu
   ```

4. **Permission denied on scripts**
   ```bash
   # Make scripts executable
   chmod +x tests/scripts/*.sh
   ```

### Debug Mode

Run tests with verbose output:
```bash
cd tests/scripts && ./runner.sh --full --logs
```

### Manual Testing

For debugging specific endpoints:
```bash
# Start server
npm run dev

# Test specific endpoint
curl -X GET http://localhost:3000/api/authors | jq .
```

## Future Improvements

### Short Term
- [ ] Add proper unit tests with Jest/Vitest
- [ ] Implement test database isolation
- [ ] Add API response schema validation
- [ ] Performance benchmarking

### Long Term
- [ ] End-to-end tests with Playwright
- [ ] Load testing with K6
- [ ] Contract testing with Pact
- [ ] Test coverage reporting
- [ ] Mutation testing

## Contributing

1. Write tests for new features
2. Ensure all tests pass before submitting PR
3. Add test documentation for complex scenarios
4. Follow existing naming conventions
5. Clean up test data in teardown methods

## Support

- Check test logs in `server.log`
- Review API documentation in main README
- Check MongoDB logs for database issues
- Use `npm run test:health` to verify system health