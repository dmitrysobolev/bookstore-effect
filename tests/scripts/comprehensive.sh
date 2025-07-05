#!/bin/bash

set -x

# Comprehensive Bookstore API Test Suite
# This script performs automated testing of the entire bookstore API

set -e  # Exit on any error

BASE_URL="http://localhost:3000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Arrays to store created IDs for cleanup
AUTHOR_IDS=()
BOOK_IDS=()

# Function to log test results
log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name" >&2
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - $test_name: $message" >&2
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to make API calls and validate responses
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="$4"
    local test_name="$5"

    echo -e "${BLUE}🔄 Testing: $test_name${NC}" >&2
    echo -e "${YELLOW}$method $BASE_URL$endpoint${NC}" >&2

    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi

    # Split response body and status code
    response_body=$(echo "$response" | sed '$d')
    status_code=$(echo "$response" | tail -n 1)

    # Validate status code
    if [ "$status_code" = "$expected_status" ]; then
        log_test "$test_name" "PASS"
        echo "$response_body"
        return 0
    else
        log_test "$test_name" "FAIL" "Expected status $expected_status, got $status_code"
        echo "Response: $response_body" >&2
        return 1
    fi
}

# Function to extract ID from JSON response
extract_id() {
    local json="$1"
    echo "$json" | jq -r '._id'
}

# Function to check if server is running
check_server() {
    echo -e "${BLUE}🔍 Checking if server is running...${NC}"

    if curl -s -f "$BASE_URL/books" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Server is not running. Please start it with 'npm run dev'${NC}"
        echo "Run: npm run dev"
        exit 1
    fi
}

# Function to setup test environment
setup_test_environment() {
    echo -e "${BLUE}🔧 Setting up test environment...${NC}"
    echo "Test environment ready"
}

# Function to cleanup test data
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up test data...${NC}"

    # Delete created books
    for book_id in "${BOOK_IDS[@]}"; do
        if [ -n "$book_id" ] && [ "$book_id" != "null" ]; then
            echo "Deleting book: $book_id"
            curl -s -X DELETE "$BASE_URL/books/$book_id" > /dev/null || true
        fi
    done

    # Delete created authors
    for author_id in "${AUTHOR_IDS[@]}"; do
        if [ -n "$author_id" ] && [ "$author_id" != "null" ]; then
            echo "Deleting author: $author_id"
            curl -s -X DELETE "$BASE_URL/authors/$author_id" > /dev/null || true
        fi
    done

    echo -e "${GREEN}✓ Cleanup completed${NC}"
}

# Function to perform a hard cleanup of the database
hard_cleanup() {
    echo -e "${BLUE}🧹 Performing hard cleanup...${NC}"
    # Get all book IDs and delete them
    all_book_ids=$(curl -s "$BASE_URL/books" | jq -r '.[]._id')
    for id in $all_book_ids; do
        curl -s -X DELETE "$BASE_URL/books/$id" > /dev/null
    done

    # Get all author IDs and delete them
    all_author_ids=$(curl -s "$BASE_URL/authors" | jq -r '.[]._id')
    for id in $all_author_ids; do
        curl -s -X DELETE "$BASE_URL/authors/$id" > /dev/null
    done
    echo -e "${GREEN}✓ Hard cleanup completed${NC}"
}

# Function to run author tests
test_authors() {
    echo -e "${PURPLE}📚 TESTING AUTHORS${NC}"
    echo "=================================="

    # Test 1: Create Author 1 (George Orwell)
    author1_data='{
        "firstName": "George",
        "lastName": "Orwell",
        "fullName": "George Orwell",
        "biography": "Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist and critic.",
        "birthDate": "1903-06-25T00:00:00.000Z",
        "nationality": "British",
        "website": "https://en.wikipedia.org/wiki/George_Orwell"
    }'

    response1=$(api_call "POST" "/authors" "$author1_data" "201" "Create George Orwell")
    if [ $? -eq 0 ]; then
        AUTHOR1_ID=$(extract_id "$response1")
        AUTHOR_IDS+=("$AUTHOR1_ID")
        echo "Created Author 1 ID: $AUTHOR1_ID"
    fi

    # Test 2: Create Author 2 (Jane Austen)
    author2_data='{
        "firstName": "Jane",
        "lastName": "Austen",
        "fullName": "Jane Austen",
        "biography": "Jane Austen was an English novelist known primarily for her six major novels.",
        "birthDate": "1775-12-16T00:00:00.000Z",
        "nationality": "British",
        "website": "https://en.wikipedia.org/wiki/Jane_Austen",
        "socialLinks": {
            "twitter": "@JaneAusten",
            "facebook": "JaneAustenOfficial"
        }
    }'

    response2=$(api_call "POST" "/authors" "$author2_data" "201" "Create Jane Austen")
    if [ $? -eq 0 ]; then
        AUTHOR2_ID=$(extract_id "$response2")
        AUTHOR_IDS+=("$AUTHOR2_ID")
        echo "Created Author 2 ID: $AUTHOR2_ID"
    fi

    # Test 3: Create Author 3 (Stephen King)
    author3_data='{
        "firstName": "Stephen",
        "lastName": "King",
        "fullName": "Stephen King",
        "biography": "American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.",
        "birthDate": "1947-09-21T00:00:00.000Z",
        "nationality": "American",
        "website": "https://stephenking.com"
    }'

    response3=$(api_call "POST" "/authors" "$author3_data" "201" "Create Stephen King")
    if [ $? -eq 0 ]; then
        AUTHOR3_ID=$(extract_id "$response3")
        AUTHOR_IDS+=("$AUTHOR3_ID")
        echo "Created Author 3 ID: $AUTHOR3_ID"
    fi

    # Test 4: Try to create duplicate author (should fail)
    api_call "POST" "/authors" "$author1_data" "409" "Create duplicate author (should fail)"

    # Test 5: Get all authors
    api_call "GET" "/authors" "" "200" "Get all authors"

    # Test 6: Get author by ID
    if [ -n "$AUTHOR1_ID" ]; then
        api_call "GET" "/authors/$AUTHOR1_ID" "" "200" "Get author by ID"
    fi

    # Test 7: Get non-existent author
    api_call "GET" "/authors/507f1f77bcf86cd799439011" "" "404" "Get non-existent author"

    # Test 8: Search authors
    api_call "GET" "/authors/search/george" "" "200" "Search authors for 'george'"

    # Test 9: Get authors by nationality
    api_call "GET" "/authors/nationality/british" "" "200" "Get British authors"

    # Test 10: Get authors by name
    api_call "GET" "/authors/name/orwell" "" "200" "Get authors by name 'orwell'"

    # Test 11: Update author
    if [ -n "$AUTHOR1_ID" ]; then
        update_data='{"biography": "Updated biography for George Orwell."}'
        api_call "PUT" "/authors/$AUTHOR1_ID" "$update_data" "200" "Update author biography"
    fi

    echo ""
}

# Function to run book tests
test_books() {
    echo -e "${PURPLE}📖 TESTING BOOKS${NC}"
    echo "=================================="

    # Test 1: Create Book 1 (1984)
    if [ -n "$AUTHOR1_ID" ]; then
        book1_data="{
            \"title\": \"1984\",
            \"authorIds\": [\"$AUTHOR1_ID\"],
            \"isbn\": \"978-0452284234\",
            \"price\": 15.99,
            \"stock\": 50,
            \"genre\": \"Dystopian Fiction\",
            \"description\": \"A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.\",
            \"publishedDate\": \"1949-06-08T00:00:00.000Z\"
        }"

        response1=$(api_call "POST" "/books" "$book1_data" "201" "Create book '1984'")
        if [ $? -eq 0 ]; then
            BOOK1_ID=$(extract_id "$response1")
            BOOK_IDS+=("$BOOK1_ID")
            echo "Created Book 1 ID: $BOOK1_ID"
        fi
    fi

    # Test 2: Create Book 2 (Pride and Prejudice)
    if [ -n "$AUTHOR2_ID" ]; then
        book2_data="{
            \"title\": \"Pride and Prejudice\",
            \"authorIds\": [\"$AUTHOR2_ID\"],
            \"isbn\": \"978-0141439518\",
            \"price\": 12.99,
            \"stock\": 30,
            \"genre\": \"Romance\",
            \"description\": \"A romantic novel of manners written by Jane Austen in 1813.\",
            \"publishedDate\": \"1813-01-28T00:00:00.000Z\"
        }"

        response2=$(api_call "POST" "/books" "$book2_data" "201" "Create book 'Pride and Prejudice'")
        if [ $? -eq 0 ]; then
            BOOK2_ID=$(extract_id "$response2")
            BOOK_IDS+=("$BOOK2_ID")
            echo "Created Book 2 ID: $BOOK2_ID"
        fi
    fi

    # Test 3: Create Book 3 (The Shining)
    if [ -n "$AUTHOR3_ID" ]; then
        book3_data="{
            \"title\": \"The Shining\",
            \"authorIds\": [\"$AUTHOR3_ID\"],
            \"isbn\": \"978-0307743657\",
            \"price\": 16.99,
            \"stock\": 25,
            \"genre\": \"Horror\",
            \"description\": \"A horror novel about a family that becomes caretakers at an isolated hotel.\",
            \"publishedDate\": \"1977-01-28T00:00:00.000Z\"
        }"

        response3=$(api_call "POST" "/books" "$book3_data" "201" "Create book 'The Shining'")
        if [ $? -eq 0 ]; then
            BOOK3_ID=$(extract_id "$response3")
            BOOK_IDS+=("$BOOK3_ID")
            echo "Created Book 3 ID: $BOOK3_ID"
        fi
    fi

    # Test 4: Create book with multiple authors
    if [ -n "$AUTHOR1_ID" ] && [ -n "$AUTHOR2_ID" ]; then
        collab_book_data="{
            \"title\": \"Collaborative Novel\",
            \"authorIds\": [\"$AUTHOR1_ID\", \"$AUTHOR2_ID\"],
            \"isbn\": \"978-1234567890\",
            \"price\": 20.99,
            \"stock\": 15,
            \"genre\": \"Fiction\",
            \"description\": \"A fictional collaboration between Orwell and Austen.\"
        }"

        response4=$(api_call "POST" "/books" "$collab_book_data" "201" "Create book with multiple authors")
        if [ $? -eq 0 ]; then
            BOOK4_ID=$(extract_id "$response4")
            BOOK_IDS+=("$BOOK4_ID")
            echo "Created Collaborative Book ID: $BOOK4_ID"
        fi
    fi

    # Test 5: Try to create book with duplicate ISBN (should fail)
    if [ -n "$AUTHOR1_ID" ]; then
        duplicate_isbn_data="{
            \"title\": \"Another Book\",
            \"authorIds\": [\"$AUTHOR1_ID\"],
            \"isbn\": \"978-0452284234\",
            \"price\": 10.99,
            \"stock\": 10,
            \"genre\": \"Fiction\"
        }"
        api_call "POST" "/books" "$duplicate_isbn_data" "409" "Create book with duplicate ISBN (should fail)"
    fi

    # Test 6: Try to create book with non-existent author (should fail)
    invalid_author_data='{
        "title": "Invalid Book",
        "authorIds": ["507f1f77bcf86cd799439011"],
        "isbn": "978-9999999999",
        "price": 10.99,
        "stock": 10,
        "genre": "Fiction"
    }'
    api_call "POST" "/books" "$invalid_author_data" "400" "Create book with invalid author (should fail)"

    # Test 7: Get all books
    api_call "GET" "/books" "" "200" "Get all books"

    # Test 8: Get book by ID
    if [ -n "$BOOK1_ID" ]; then
        api_call "GET" "/books/$BOOK1_ID" "" "200" "Get book by ID"
    fi

    # Test 9: Get non-existent book
    api_call "GET" "/books/507f1f77bcf86cd799439011" "" "404" "Get non-existent book"

    # Test 10: Search books
    api_call "GET" "/books/search/dystopian" "" "200" "Search books for 'dystopian'"

    # Test 11: Get books by genre
    api_call "GET" "/books/genre/romance" "" "200" "Get romance books"

    # Test 12: Get books by author
    api_call "GET" "/books/author/orwell" "" "200" "Get books by author 'orwell'"

    # Test 13: Update book
    if [ -n "$BOOK1_ID" ]; then
        update_book_data='{"price": 18.99, "stock": 45}'
        api_call "PUT" "/books/$BOOK1_ID" "$update_book_data" "200" "Update book price and stock"
    fi

    # Test 14: Update book stock
    if [ -n "$BOOK1_ID" ]; then
        stock_update_data='{"quantity": 100}'
        api_call "PATCH" "/books/$BOOK1_ID/stock" "$stock_update_data" "200" "Update book stock"
    fi

    echo ""
}

# Function to test utility endpoints
test_utilities() {
    echo -e "${PURPLE}🔧 TESTING UTILITY ENDPOINTS${NC}"
    echo "=================================="

    # Test 1: Get books with authors
    api_call "GET" "/books-with-authors" "" "200" "Get books with populated author details"

    # Test 2: Get specific book with authors
    if [ -n "$BOOK1_ID" ]; then
        api_call "GET" "/books-with-authors/$BOOK1_ID" "" "200" "Get specific book with author details"
    fi

    # Test 3: Get non-existent book with authors
    api_call "GET" "/books-with-authors/507f1f77bcf86cd799439011" "" "404" "Get non-existent book with authors"

    echo ""
}

# Function to test error scenarios
test_error_scenarios() {
    echo -e "${PURPLE}⚠️  TESTING ERROR SCENARIOS${NC}"
    echo "=================================="

    # Test 1: Invalid JSON payload
    api_call "POST" "/authors" "invalid json" "400" "Invalid JSON payload"

    # Test 2: Missing required fields
    api_call "POST" "/authors" '{"firstName": "Test"}' "400" "Missing required fields"

    # Test 3: Invalid book price (negative)
    if [ -n "$AUTHOR1_ID" ]; then
        invalid_price_data="{
            \"title\": \"Invalid Price Book\",
            \"authorIds\": [\"$AUTHOR1_ID\"],
            \"isbn\": \"978-1111111111\",
            \"price\": -10.99,
            \"stock\": 10,
            \"genre\": \"Fiction\"
        }"
        api_call "POST" "/books" "$invalid_price_data" "400" "Book with negative price (should fail)"
    fi

    # Test 4: Non-existent endpoint
    api_call "GET" "/nonexistent" "" "404" "Non-existent endpoint"

    # Test 5: Invalid HTTP method
    api_call "PATCH" "/authors" "" "404" "Invalid HTTP method on authors endpoint"

    echo ""
}

# Function to test performance with bulk data
test_performance() {
    echo -e "${PURPLE}⚡ TESTING PERFORMANCE${NC}"
    echo "=================================="

    local start_time=$(date +%s)

    # Create multiple authors
    for i in {1..5}; do
        author_data="{
            \"firstName\": \"TestAuthor$i\",
            \"lastName\": \"LastName$i\",
            \"fullName\": \"TestAuthor$i LastName$i\",
            \"biography\": \"Test biography for author $i\",
            \"nationality\": \"TestCountry$i\"
        }"

        response=$(api_call "POST" "/authors" "$author_data" "201" "Create test author $i")
        if [ $? -eq 0 ]; then
            author_id=$(extract_id "$response")
            AUTHOR_IDS+=("$author_id")
        fi
    done

    # Create multiple books
    for i in {1..10}; do
        if [ ${#AUTHOR_IDS[@]} -gt 0 ]; then
            # Use a random author from our created authors
            random_author=${AUTHOR_IDS[$((RANDOM % ${#AUTHOR_IDS[@]}))]}

            book_data="{
                \"title\": \"Test Book $i\",
                \"authorIds\": [\"$random_author\"],
                \"isbn\": \"978-000000000$i\",
                \"price\": $((10 + i)).99,
                \"stock\": $((20 + i)),
                \"genre\": \"TestGenre$((i % 3 + 1))\",
                \"description\": \"Test description for book $i\"
            }"

            response=$(api_call "POST" "/books" "$book_data" "201" "Create test book $i")
            if [ $? -eq 0 ]; then
                book_id=$(extract_id "$response")
                BOOK_IDS+=("$book_id")
            fi
        fi
    done

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo -e "${CYAN}Performance test completed in ${duration} seconds${NC}"

    # Test bulk retrieval
    api_call "GET" "/books" "" "200" "Get all books (bulk test)"
    api_call "GET" "/authors" "" "200" "Get all authors (bulk test)"
    api_call "GET" "/books-with-authors" "" "200" "Get books with authors (bulk test)"

    echo ""
}

# Function to print test summary
print_summary() {
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}TEST SUMMARY${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo -e "Total Tests: ${TOTAL_TESTS}"
    echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
    echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
        exit 0
    else
        echo -e "${RED}❌ SOME TESTS FAILED${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${CYAN}🚀 COMPREHENSIVE BOOKSTORE API TESTING${NC}"
    echo -e "${CYAN}=======================================${NC}"
    echo ""

    # Setup
    check_server
    hard_cleanup
    setup_test_environment

    # Set up cleanup trap
    trap cleanup EXIT

    # Run test suites
    test_authors
    test_books
    test_utilities
    test_error_scenarios
    test_performance

    # Print results
    print_summary
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required but not installed.${NC}"
    echo "Please install jq: brew install jq (macOS) or apt-get install jq (Ubuntu)"
    exit 1
fi

# Run main function
main "$@"
