#!/bin/bash

# Test Runner Script for Bookstore API
# This script starts the server and runs comprehensive tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SERVER_PID=""
SERVER_PORT=3000
MAX_WAIT_TIME=30

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}🧹 Cleaning up...${NC}"
    if [ -n "$SERVER_PID" ]; then
        echo "Stopping server (PID: $SERVER_PID)"
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ Cleanup completed${NC}"
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

# Function to check if server is running
check_server() {
    curl -s -f "http://localhost:$SERVER_PORT/api/books" > /dev/null 2>&1
}

# Function to wait for server to start
wait_for_server() {
    echo -e "${BLUE}⏳ Waiting for server to start...${NC}"
    local wait_time=0

    while [ $wait_time -lt $MAX_WAIT_TIME ]; do
        if check_server; then
            echo -e "${GREEN}✓ Server is ready!${NC}"
            return 0
        fi

        echo -n "."
        sleep 1
        wait_time=$((wait_time + 1))
    done

    echo -e "\n${RED}✗ Server failed to start within $MAX_WAIT_TIME seconds${NC}"
    return 1
}

# Function to start the server
start_server() {
    echo -e "${BLUE}🚀 Starting Bookstore API server...${NC}"

    # Check if server is already running
    if check_server; then
        echo -e "${YELLOW}⚠️  Server is already running on port $SERVER_PORT${NC}"
        echo -e "${YELLOW}   Using existing server instance${NC}"
        return 0
    fi

    # Build the project first
    echo -e "${BLUE}🔨 Building project...${NC}"
    if ! npm run build 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Build failed, trying to compile simple-server directly...${NC}"
        npx tsc src/simple-server.ts --outDir dist --target ES2020 --module CommonJS --esModuleInterop --allowSyntheticDefaultImports --strict --skipLibCheck
    fi

    # Start the server in development mode
    echo -e "${BLUE}🔧 Starting server in development mode...${NC}"
    npm run dev > server.log 2>&1 &
    SERVER_PID=$!

    echo "Server started with PID: $SERVER_PID"
    echo "Server logs are being written to: server.log"

    # Wait for server to be ready
    if ! wait_for_server; then
        echo -e "${RED}Failed to start server. Check server.log for details:${NC}"
        tail -n 20 server.log
        exit 1
    fi
}

# Function to run comprehensive tests
run_tests() {
    echo -e "\n${PURPLE}🧪 Running comprehensive API tests...${NC}"
    echo -e "${PURPLE}=====================================${NC}"

    if [ -f "./comprehensive.sh" ]; then
        chmod +x ./comprehensive.sh
        ./comprehensive.sh
    else
        echo -e "${RED}✗ comprehensive.sh not found${NC}"
        exit 1
    fi
}

# Function to run quick smoke tests
run_smoke_tests() {
    echo -e "\n${PURPLE}💨 Running smoke tests...${NC}"
    echo -e "${PURPLE}=========================${NC}"

    BASE_URL="http://localhost:$SERVER_PORT/api"

    # Test 1: Health check - Get all books (should return empty array initially)
    echo -e "${BLUE}📋 Testing basic endpoints...${NC}"

    if curl -s -f "$BASE_URL/books" > /dev/null; then
        echo -e "${GREEN}✓ GET /books - OK${NC}"
    else
        echo -e "${RED}✗ GET /books - FAILED${NC}"
        return 1
    fi

    if curl -s -f "$BASE_URL/authors" > /dev/null; then
        echo -e "${GREEN}✓ GET /authors - OK${NC}"
    else
        echo -e "${RED}✗ GET /authors - FAILED${NC}"
        return 1
    fi

    # Test 2: Create a test author
    echo -e "${BLUE}👤 Testing author creation...${NC}"
    author_response=$(curl -s -X POST "$BASE_URL/authors" \
        -H "Content-Type: application/json" \
        -d '{
            "firstName": "Test",
            "lastName": "Author",
            "fullName": "Test Author",
            "biography": "A test author for smoke testing"
        }')

    if echo "$author_response" | jq -e '._id' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ POST /authors - OK${NC}"
        author_id=$(echo "$author_response" | jq -r '._id')

        # Test 3: Create a test book
        echo -e "${BLUE}📖 Testing book creation...${NC}"
        book_response=$(curl -s -X POST "$BASE_URL/books" \
            -H "Content-Type: application/json" \
            -d "{
                \"title\": \"Test Book\",
                \"authorIds\": [\"$author_id\"],
                \"isbn\": \"978-0000000000\",
                \"price\": 19.99,
                \"stock\": 10,
                \"genre\": \"Test\"
            }")

        if echo "$book_response" | jq -e '._id' > /dev/null 2>&1; then
            echo -e "${GREEN}✓ POST /books - OK${NC}"
            book_id=$(echo "$book_response" | jq -r '._id')

            # Test 4: Test utility endpoint
            echo -e "${BLUE}🔗 Testing utility endpoints...${NC}"
            if curl -s -f "$BASE_URL/books-with-authors" > /dev/null; then
                echo -e "${GREEN}✓ GET /books-with-authors - OK${NC}"
            else
                echo -e "${RED}✗ GET /books-with-authors - FAILED${NC}"
            fi

            # Cleanup test data
            echo -e "${BLUE}🧹 Cleaning up test data...${NC}"
            curl -s -X DELETE "$BASE_URL/books/$book_id" > /dev/null
            curl -s -X DELETE "$BASE_URL/authors/$author_id" > /dev/null
            echo -e "${GREEN}✓ Cleanup completed${NC}"
        else
            echo -e "${RED}✗ POST /books - FAILED${NC}"
            echo "Response: $book_response"
            return 1
        fi
    else
        echo -e "${RED}✗ POST /authors - FAILED${NC}"
        echo "Response: $author_response"
        return 1
    fi

    echo -e "\n${GREEN}🎉 All smoke tests passed!${NC}"
}

# Function to show server logs
show_logs() {
    echo -e "\n${BLUE}📋 Server logs (last 20 lines):${NC}"
    echo -e "${BLUE}================================${NC}"
    if [ -f "server.log" ]; then
        tail -n 20 server.log
    else
        echo "No server logs found"
    fi
}

# Function to show help
show_help() {
    echo -e "${CYAN}Bookstore API Test Runner${NC}"
    echo -e "${CYAN}=========================${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --smoke, -s      Run only smoke tests (quick validation)"
    echo "  --full, -f       Run comprehensive test suite (default)"
    echo "  --no-server      Don't start server (assume it's already running)"
    echo "  --logs, -l       Show server logs after tests"
    echo "  --help, -h       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run full test suite with server startup"
    echo "  $0 --smoke           # Run quick smoke tests"
    echo "  $0 --no-server       # Run tests against existing server"
    echo "  $0 --full --logs     # Run full tests and show logs"
    echo ""
}

# Main function
main() {
    local run_comprehensive=true
    local start_server_flag=true
    local show_logs_flag=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --smoke|-s)
                run_comprehensive=false
                shift
                ;;
            --full|-f)
                run_comprehensive=true
                shift
                ;;
            --no-server)
                start_server_flag=false
                shift
                ;;
            --logs|-l)
                show_logs_flag=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done

    echo -e "${CYAN}🧪 BOOKSTORE API TEST RUNNER${NC}"
    echo -e "${CYAN}=============================${NC}"
    echo ""

    # Check prerequisites
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is required but not installed.${NC}"
        echo "Please install jq:"
        echo "  macOS: brew install jq"
        echo "  Ubuntu/Debian: apt-get install jq"
        echo "  CentOS/RHEL: yum install jq"
        exit 1
    fi

    if ! command -v curl &> /dev/null; then
        echo -e "${RED}Error: curl is required but not installed.${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is required but not installed.${NC}"
        exit 1
    fi

    # Start server if requested
    if [ "$start_server_flag" = true ]; then
        start_server
    else
        echo -e "${BLUE}🔍 Checking if server is running...${NC}"
        if ! check_server; then
            echo -e "${RED}✗ Server is not running on port $SERVER_PORT${NC}"
            echo "Please start the server manually or remove --no-server flag"
            exit 1
        fi
        echo -e "${GREEN}✓ Server is running${NC}"
    fi

    # Run tests
    if [ "$run_comprehensive" = true ]; then
        run_tests
    else
        run_smoke_tests
    fi

    # Show logs if requested
    if [ "$show_logs_flag" = true ]; then
        show_logs
    fi

    echo -e "\n${GREEN}🎉 Test run completed successfully!${NC}"
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
