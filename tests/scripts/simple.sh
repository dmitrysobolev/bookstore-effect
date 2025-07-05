#!/bin/bash

# Simple Bookstore API Test Script
# This script performs basic manual testing of the bookstore API

BASE_URL="http://localhost:3000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Simple Bookstore API Testing${NC}"
echo "=================================="
echo ""

# Function to make API calls
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local description="$4"

    echo -e "${BLUE}Testing: $description${NC}"
    echo -e "${YELLOW}$method $BASE_URL$endpoint${NC}"

    if [ -n "$data" ]; then
        echo -e "${YELLOW}Data: $data${NC}"
        curl -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint" \
            -w "\nStatus: %{http_code}\n\n" \
            -s
    else
        curl -X "$method" \
            "$BASE_URL$endpoint" \
            -w "\nStatus: %{http_code}\n\n" \
            -s
    fi
    echo "---"
    echo ""
}

# Check if server is running
echo -e "${BLUE}Checking if server is running...${NC}"
if curl -s -f "$BASE_URL/books" > /dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running. Start it with: npm run dev${NC}"
    exit 1
fi
echo ""

# Test 1: Get all books (should be empty initially)
test_endpoint "GET" "/books" "" "Get all books"

# Test 2: Get all authors (should be empty initially)
test_endpoint "GET" "/authors" "" "Get all authors"

# Test 3: Create first author
author1_data='{
    "firstName": "George",
    "lastName": "Orwell",
    "fullName": "George Orwell",
    "biography": "English novelist and critic",
    "nationality": "British"
}'
test_endpoint "POST" "/authors" "$author1_data" "Create George Orwell"

# Test 4: Create second author
author2_data='{
    "firstName": "Jane",
    "lastName": "Austen",
    "fullName": "Jane Austen",
    "biography": "English novelist",
    "nationality": "British"
}'
test_endpoint "POST" "/authors" "$author2_data" "Create Jane Austen"

# Test 5: Get all authors again
test_endpoint "GET" "/authors" "" "Get all authors (should have 2)"

# Test 6: Search authors
test_endpoint "GET" "/authors/search/george" "" "Search for 'george'"

# Test 7: Get authors by nationality
test_endpoint "GET" "/authors/nationality/british" "" "Get British authors"

echo -e "${GREEN}Manual testing complete!${NC}"
echo ""
echo -e "${YELLOW}To create books, you need to:${NC}"
echo "1. Copy an author ID from the responses above"
echo "2. Use it in a book creation request like this:"
echo ""
echo "curl -X POST $BASE_URL/books \\"
echo '  -H "Content-Type: application/json" \'
echo '  -d '\''{'
echo '    "title": "1984",'
echo '    "authorIds": ["AUTHOR_ID_HERE"],'
echo '    "isbn": "978-0452284234",'
echo '    "price": 15.99,'
echo '    "stock": 50,'
echo '    "genre": "Dystopian Fiction"'
echo '  }'\'''
echo ""
echo -e "${YELLOW}Then test other endpoints:${NC}"
echo "- GET $BASE_URL/books"
echo "- GET $BASE_URL/books/search/fiction"
echo "- GET $BASE_URL/books-with-authors"
echo ""
