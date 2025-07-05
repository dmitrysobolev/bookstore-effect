# Bookstore Management API

A TypeScript bookstore management system built with Effect, Express.js, and MongoDB. This API provides comprehensive CRUD operations for both books and authors with advanced search and filtering capabilities.

## 🚀 Features

- **Books Management**: Full CRUD operations for books
- **Authors Management**: Complete author management system
- **Relationship Management**: Books reference authors by ID with data integrity validation
- **Advanced Search**: Search across books and authors with multiple criteria
- **Stock Management**: Update book inventory levels
- **Data Validation**: Schema validation using Effect Schema
- **Error Handling**: Comprehensive error handling with meaningful messages

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or remote instance)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bookstore
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

## 📖 Book Endpoints

### Get All Books
```http
GET /api/books
```

**Response:**
```json
[
  {
    "_id": "book_id",
    "title": "1984",
    "authorIds": ["author_id_1"],
    "isbn": "978-0452284234",
    "price": 15.99,
    "stock": 50,
    "genre": "Dystopian Fiction",
    "description": "A dystopian social science fiction novel...",
    "publishedDate": "1949-06-08T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Book by ID
```http
GET /api/books/:id
```

### Create Book
```http
POST /api/books
```

**Request Body:**
```json
{
  "title": "Pride and Prejudice",
  "authorIds": ["author_id_1"],
  "isbn": "978-0141439518",
  "price": 12.99,
  "stock": 30,
  "genre": "Romance",
  "description": "A romantic novel of manners...",
  "publishedDate": "1813-01-28T00:00:00.000Z"
}
```

### Update Book
```http
PUT /api/books/:id
```

### Delete Book
```http
DELETE /api/books/:id
```

### Search Books
```http
GET /api/books/search/:query
```
Searches across title, genre, and author names.

### Get Books by Genre
```http
GET /api/books/genre/:genre
```

### Get Books by Author
```http
GET /api/books/author/:author
```
Searches by author name (firstName, lastName, or fullName).

### Update Book Stock
```http
PATCH /api/books/:id/stock
```

**Request Body:**
```json
{
  "quantity": 5
}
```

## 👤 Author Endpoints

### Get All Authors
```http
GET /api/authors
```

**Response:**
```json
[
  {
    "_id": "author_id",
    "firstName": "George",
    "lastName": "Orwell",
    "fullName": "George Orwell",
    "biography": "Eric Arthur Blair, known by his pen name...",
    "birthDate": "1903-06-25T00:00:00.000Z",
    "nationality": "British",
    "website": "https://en.wikipedia.org/wiki/George_Orwell",
    "socialLinks": {
      "twitter": "@GeorgeOrwell",
      "facebook": "GeorgeOrwellOfficial"
    },
    "profileImageUrl": "https://example.com/orwell.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Author by ID
```http
GET /api/authors/:id
```

### Create Author
```http
POST /api/authors
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Austen",
  "fullName": "Jane Austen",
  "biography": "Jane Austen was an English novelist...",
  "birthDate": "1775-12-16T00:00:00.000Z",
  "nationality": "British",
  "website": "https://en.wikipedia.org/wiki/Jane_Austen",
  "socialLinks": {
    "twitter": "@JaneAusten",
    "facebook": "JaneAustenOfficial",
    "instagram": "@janeausten",
    "linkedin": "janeausten"
  },
  "profileImageUrl": "https://example.com/austen.jpg"
}
```

### Update Author
```http
PUT /api/authors/:id
```

### Delete Author
```http
DELETE /api/authors/:id
```

### Search Authors
```http
GET /api/authors/search/:query
```
Searches across firstName, lastName, fullName, biography, and nationality.

### Get Authors by Nationality
```http
GET /api/authors/nationality/:nationality
```

### Get Authors by Name
```http
GET /api/authors/name/:name
```

## 🔗 Utility Endpoints

### Get Books with Author Details
```http
GET /api/books-with-authors
```
Returns books with populated author information instead of just IDs.

### Get Specific Book with Author Details
```http
GET /api/books-with-authors/:id
```

## 📊 Data Models

### Book Schema
```typescript
{
  _id?: BookId;           // Auto-generated
  title: string;          // Required
  authorIds: AuthorId[];  // Required - Array of author IDs
  isbn: string;           // Required - Unique
  price: number;          // Required
  stock: number;          // Required
  genre: string;          // Required
  description?: string;   // Optional
  publishedDate?: Date;   // Optional
  createdAt?: Date;       // Auto-generated
  updatedAt?: Date;       // Auto-updated
}
```

### Author Schema
```typescript
{
  _id?: AuthorId;         // Auto-generated
  firstName: string;      // Required
  lastName: string;       // Required
  fullName: string;       // Required - Must be unique
  biography?: string;     // Optional
  birthDate?: Date;       // Optional
  nationality?: string;   // Optional
  website?: string;       // Optional
  socialLinks?: {         // Optional
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  profileImageUrl?: string; // Optional
  createdAt?: Date;       // Auto-generated
  updatedAt?: Date;       // Auto-updated
}
```

## 🧪 Testing

The project includes a comprehensive testing suite with proper organization and multiple testing approaches.

### Quick Start Testing

```bash
# Run all tests (recommended)
npm test

# Quick smoke tests (fast validation)
npm run test:integration

# Comprehensive test suite
npm run test:full

# Manual step-by-step testing
npm run test:simple

# Check system health
npm run test:health
```

### Test Structure

```
tests/
├── unit/          # Unit tests (individual components)
├── integration/   # API integration tests
├── fixtures/      # Test data and sample objects
├── helpers/       # Testing utilities
└── scripts/       # Test automation scripts
```

### Prerequisites

Before running tests, ensure you have:

```bash
# Install dependencies
npm install

# Install jq for JSON parsing (if not installed)
brew install jq  # macOS
# or
sudo apt-get install jq  # Ubuntu/Debian

# Verify MongoDB is running
npm run test:health
```

### Testing Approaches

1. **Automated Testing** (Recommended for CI/CD):
   ```bash
   npm test                    # All tests
   npm run test:integration    # API tests only
   npm run test:full          # Comprehensive suite
   ```

2. **Manual Testing** (Good for development):
   ```bash
   npm run test:simple        # Step-by-step guide
   npm run dev               # Start server manually
   ```

3. **Direct API Testing**:
   ```bash
   # Start server
   npm run dev
   
   # Test endpoints with curl
   curl http://localhost:3000/api/authors | jq .
   ```

### Example API Usage

1. **Create an Author:**
```bash
curl -X POST http://localhost:3000/api/authors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Stephen",
    "lastName": "King",
    "fullName": "Stephen King",
    "biography": "American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.",
    "nationality": "American"
  }'
```

2. **Create a Book (replace AUTHOR_ID with actual ID):**
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Shining",
    "authorIds": ["AUTHOR_ID"],
    "isbn": "978-0307743657",
    "price": 16.99,
    "stock": 25,
    "genre": "Horror"
  }'
```

3. **Search Books:**
```bash
curl http://localhost:3000/api/books/search/horror
```

4. **Update Stock:**
```bash
curl -X PATCH http://localhost:3000/api/books/BOOK_ID/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 10}'
```

### Test Coverage

The testing suite covers:
- ✅ Author CRUD operations
- ✅ Book CRUD operations  
- ✅ Search functionality
- ✅ Data validation
- ✅ Error handling
- ✅ Relationship integrity
- ✅ Performance testing
- ✅ Bulk operations

For detailed testing documentation, see [`tests/README.md`](tests/README.md).

## ⚙️ Architecture

The application follows a clean architecture pattern:

- **Models**: Effect Schema definitions for data validation
- **Repositories**: Data access layer for MongoDB operations
- **Services**: Business logic layer with validation rules
- **Routes**: HTTP endpoint handlers using Express.js
- **Database**: MongoDB connection management using Effect

### Technology Stack
- **TypeScript**: Type safety and developer experience
- **Effect**: Functional programming library for error handling and dependency injection
- **Express.js**: HTTP server framework
- **MongoDB**: NoSQL database for data persistence
- **Effect Schema**: Runtime type validation

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=bookstore
PORT=3000
```

## 📝 Business Rules

1. **Author Name Uniqueness**: Author full names must be unique
2. **ISBN Uniqueness**: Book ISBNs must be unique
3. **Author Validation**: Books must reference existing authors
4. **Stock Management**: Stock cannot go below zero
5. **Data Integrity**: Deleting an author with associated books should be handled carefully

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Descriptive error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## 🔮 Future Enhancements

- [ ] Authentication and authorization
- [ ] Pagination for large datasets
- [ ] File upload for author profile images
- [ ] Book categories and tags
- [ ] Advanced filtering and sorting
- [ ] Database migrations
- [ ] API rate limiting
- [ ] Caching layer
- [ ] Full-text search with MongoDB Atlas Search

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For questions or issues, please open an issue on the GitHub repository.