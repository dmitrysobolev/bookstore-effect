#!/bin/bash

# Bookstore API Test Script
# This script demonstrates the functionality of both Books and Authors APIs

BASE_URL="http://localhost:3000/api"

echo "🚀 Testing Bookstore Management API"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to make API calls and display results
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    echo -e "${BLUE}📍 ${description}${NC}"
    echo -e "${YELLOW}${method} ${BASE_URL}${endpoint}${NC}"

    if [ -n "$data" ]; then
        echo -e "${YELLOW}Data: ${data}${NC}"
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${BASE_URL}${endpoint}")
    else
        response=$(curl -s -X $method "${BASE_URL}${endpoint}")
    fi

    echo -e "${GREEN}Response:${NC}"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    echo ""
    echo "---"
    echo ""
}

echo "🧪 Starting API Tests..."
echo ""

# Test 1: Create Authors
echo -e "${BLUE}=== TESTING AUTHORS ===${NC}"
echo ""

AUTHOR1_DATA='{
  "firstName": "George",
  "lastName": "Orwell",
  "fullName": "George Orwell",
  "biography": "Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist and critic.",
  "birthDate": "1903-06-25T00:00:00.000Z",
  "nationality": "British",
  "website": "https://en.wikipedia.org/wiki/George_Orwell"
}'

AUTHOR2_DATA='{
  "firstName": "Jane",
  "lastName": "Austen",
  "fullName": "Jane Austen",
  "biography": "Jane Austen was an English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry at the end of the 18th century.",
  "birthDate": "1775-12-16T00:00:00.000Z",
  "nationality": "British",
  "website": "https://en.wikipedia.org/wiki/Jane_Austen",
  "socialLinks": {
    "twitter": "@JaneAusten",
    "facebook": "JaneAustenOfficial"
  }
}'

make_request "POST" "/authors" "$AUTHOR1_DATA" "Creating George Orwell"
make_request "POST" "/authors" "$AUTHOR2_DATA" "Creating Jane Austen"

# Test 2: Get all authors
make_request "GET" "/authors" "" "Getting all authors"

# Test 3: Search authors
make_request "GET" "/authors/search/george" "" "Searching for 'george'"

# Test 4: Get authors by nationality
make_request "GET" "/authors/nationality/british" "" "Getting British authors"

echo -e "${BLUE}=== TESTING BOOKS ===${NC}"
echo ""

# Note: You'll need to replace these IDs with actual IDs from the author creation responses
# For demo purposes, we'll use placeholder IDs
BOOK1_DATA='{
  "title": "1984",
  "authorIds": ["REPLACE_WITH_ORWELL_ID"],
  "isbn": "978-0452284234",
  "price": 15.99,
  "stock": 50,
  "genre": "Dystopian Fiction",
  "description": "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism."
}'

BOOK2_DATA='{
  "title": "Pride and Prejudice",
  "authorIds": ["REPLACE_WITH_AUSTEN_ID"],
  "isbn": "978-0141439518",
  "price": 12.99,
  "stock": 30,
  "genre": "Romance",
  "description": "A romantic novel of manners written by Jane Austen in 1813."
}'

echo -e "${RED}⚠️  Note: To test book creation, you need to:${NC}"
echo "1. Copy the author IDs from the author creation responses above"
echo "2. Replace 'REPLACE_WITH_ORWELL_ID' and 'REPLACE_WITH_AUSTEN_ID' in the book data"
echo "3. Run the book creation requests manually"
echo ""

echo "Example book creation (replace the ID):"
echo -e "${YELLOW}curl -X POST ${BASE_URL}/books \\${NC}"
echo -e "${YELLOW}  -H \"Content-Type: application/json\" \\${NC}"
echo -e "${YELLOW}  -d '${BOOK1_DATA}'${NC}"
echo ""

# Test 5: Get all books
make_request "GET" "/books" "" "Getting all books"

# Test 6: Search functionality
make_request "GET" "/books/search/fiction" "" "Searching books for 'fiction'"

# Test 7: Get books by genre
make_request "GET" "/books/genre/romance" "" "Getting romance books"

# Test 8: Utility endpoints
make_request "GET" "/books-with-authors" "" "Getting books with populated author details"

echo -e "${GREEN}✅ API Test Complete!${NC}"
echo ""
echo "📋 Manual Testing Steps:"
echo "1. Create authors using the POST /authors endpoint"
echo "2. Copy the returned author IDs"
echo "3. Create books using those author IDs in the authorIds array"
echo "4. Test the various search and filter endpoints"
echo "5. Try updating books and authors"
echo "6. Test the books-with-authors utility endpoint"
echo ""
echo "🔧 Example curl commands for manual testing:"
echo ""
echo "# Create an author:"
echo "curl -X POST ${BASE_URL}/authors \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"firstName\":\"Test\",\"lastName\":\"Author\",\"fullName\":\"Test Author\"}'"
echo ""
echo "# Create a book (replace AUTHOR_ID with actual ID):"
echo "curl -X POST ${BASE_URL}/books \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"title\":\"Test Book\",\"authorIds\":[\"AUTHOR_ID\"],\"isbn\":\"123456789\",\"price\":19.99,\"stock\":10,\"genre\":\"Fiction\"}'"
echo ""
echo "# Update book stock:"
echo "curl -X PATCH ${BASE_URL}/books/BOOK_ID/stock \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"quantity\":5}'"
