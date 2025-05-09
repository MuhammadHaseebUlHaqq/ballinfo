#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== LaLiga News Backend Test Script ===${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if the server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}Server already running on port 3000${NC}"
    SERVER_RUNNING=true
else
    echo -e "${YELLOW}Starting server...${NC}"
    # Navigate to the server directory
    cd ../mainServer
    
    # Start the server in the background
    node server.js &
    SERVER_PID=$!
    SERVER_RUNNING=false
    
    # Wait for server to start
    echo -e "${YELLOW}Waiting for server to start...${NC}"
    sleep 5
fi

echo -e "${BLUE}=======================================${NC}"
echo -e "${YELLOW}Running tests...${NC}"

# Run the test script
node ../scripts/testNewsApi.js

# Store the exit code
TEST_EXIT_CODE=$?

# Clean up if we started the server
if [ "$SERVER_RUNNING" = false ] ; then
    echo -e "${YELLOW}Stopping server (PID: $SERVER_PID)...${NC}"
    kill $SERVER_PID
fi

# Exit with the test exit code
echo -e "${BLUE}=======================================${NC}"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Tests failed with exit code $TEST_EXIT_CODE${NC}"
    exit $TEST_EXIT_CODE
fi 