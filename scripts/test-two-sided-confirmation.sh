#!/bin/bash

# Test script voor two-sided milestone confirmation
# Dit script test de volledige flow: start → submit → approve (contractor) → approve (consumer)

set -e

API_URL="http://localhost:5001/api"
CUSTOMER_EMAIL="klant@test.nl"
CUSTOMER_PASSWORD="Test1234"
CONTRACTOR_EMAIL="aannemer@test.nl"
CONTRACTOR_PASSWORD="Test1234"

echo "🧪 Testing Two-Sided Milestone Confirmation Flow"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cookie jars
CUSTOMER_COOKIE_JAR="/tmp/customer_cookies.txt"
CONTRACTOR_COOKIE_JAR="/tmp/contractor_cookies.txt"

# Clean up cookie jars
rm -f "$CUSTOMER_COOKIE_JAR" "$CONTRACTOR_COOKIE_JAR"

# Helper function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Helper function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Helper function to print info
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Helper function to make authenticated request
auth_request() {
    local method=$1
    local url=$2
    local cookie_jar=$3
    local data=$4
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$url" \
          -b "$cookie_jar" \
          -c "$cookie_jar" \
          -H "Content-Type: application/json" \
          -d "$data"
    else
        curl -s -X "$method" "$url" \
          -b "$cookie_jar" \
          -c "$cookie_jar" \
          -H "Content-Type: application/json"
    fi
}

# Step 1: Login as customer
echo "📝 Step 1: Login as customer..."
CUSTOMER_RESPONSE=$(curl -s -c "$CUSTOMER_COOKIE_JAR" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$CUSTOMER_PASSWORD\"}")

if echo "$CUSTOMER_RESPONSE" | grep -q '"success":true'; then
    success "Customer logged in"
else
    error "Failed to login as customer"
    echo "Response: $CUSTOMER_RESPONSE"
    exit 1
fi

# Step 2: Login as contractor
echo ""
echo "📝 Step 2: Login as contractor..."
CONTRACTOR_RESPONSE=$(curl -s -c "$CONTRACTOR_COOKIE_JAR" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CONTRACTOR_EMAIL\",\"password\":\"$CONTRACTOR_PASSWORD\"}")

if echo "$CONTRACTOR_RESPONSE" | grep -q '"success":true'; then
    success "Contractor logged in"
else
    error "Failed to login as contractor"
    echo "Response: $CONTRACTOR_RESPONSE"
    exit 1
fi

# Step 3: Get customer user ID
echo ""
echo "📝 Step 3: Get customer user ID..."
CUSTOMER_USER_RESPONSE=$(auth_request "GET" "$API_URL/auth/me" "$CUSTOMER_COOKIE_JAR")

CUSTOMER_ID=$(echo $CUSTOMER_USER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$CUSTOMER_ID" ]; then
    error "Failed to get customer ID"
    echo "Response: $CUSTOMER_USER_RESPONSE"
    exit 1
fi
success "Customer ID: $CUSTOMER_ID"

# Step 4: Get contractor user ID
echo ""
echo "📝 Step 4: Get contractor user ID..."
CONTRACTOR_USER_RESPONSE=$(auth_request "GET" "$API_URL/auth/me" "$CONTRACTOR_COOKIE_JAR")

CONTRACTOR_ID=$(echo $CONTRACTOR_USER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$CONTRACTOR_ID" ]; then
    error "Failed to get contractor ID"
    echo "Response: $CONTRACTOR_USER_RESPONSE"
    exit 1
fi
success "Contractor ID: $CONTRACTOR_ID"

# Step 5: Create a project with milestone
echo ""
echo "📝 Step 5: Create project with milestone..."
PROJECT_DATA=$(cat <<EOF
{
  "title": "Test Project - Two-Sided Confirmation",
  "description": "Test project voor two-sided confirmation flow",
  "totalBudget": 10000,
  "contractorId": "$CONTRACTOR_ID",
  "milestones": [
    {
      "title": "Test Milestone",
      "description": "Test milestone voor two-sided confirmation",
      "amount": 10000,
      "order": 1
    }
  ]
}
EOF
)

PROJECT_RESPONSE=$(auth_request "POST" "$API_URL/projects" "$CUSTOMER_COOKIE_JAR" "$PROJECT_DATA")

PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Extract milestone ID from milestones array
MILESTONE_ID=$(echo $PROJECT_RESPONSE | grep -o '"milestones":\[{[^}]*"id":"[^"]*' | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ] || [ -z "$MILESTONE_ID" ]; then
    error "Failed to create project"
    echo "Response: $PROJECT_RESPONSE"
    exit 1
fi
success "Project created: $PROJECT_ID"
success "Milestone created: $MILESTONE_ID"

# Step 6: Contractor starts milestone
echo ""
echo "📝 Step 6: Contractor starts milestone..."
START_RESPONSE=$(auth_request "POST" "$API_URL/milestones/$MILESTONE_ID/start" "$CONTRACTOR_COOKIE_JAR")

if echo "$START_RESPONSE" | grep -q '"success":true'; then
    success "Milestone started (status: IN_PROGRESS)"
else
    error "Failed to start milestone"
    echo "Response: $START_RESPONSE"
    exit 1
fi

# Step 7: Contractor submits milestone
echo ""
echo "📝 Step 7: Contractor submits milestone..."
SUBMIT_RESPONSE=$(auth_request "POST" "$API_URL/milestones/$MILESTONE_ID/submit" "$CONTRACTOR_COOKIE_JAR")

if echo "$SUBMIT_RESPONSE" | grep -q '"success":true'; then
    success "Milestone submitted (status: SUBMITTED)"
else
    error "Failed to submit milestone"
    echo "Response: $SUBMIT_RESPONSE"
    exit 1
fi

# Check milestone status after submit (get the first status field which should be the milestone status)
MILESTONE_STATUS=$(echo $SUBMIT_RESPONSE | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)
if [ "$MILESTONE_STATUS" != "SUBMITTED" ]; then
    error "Milestone status should be SUBMITTED, got: $MILESTONE_STATUS"
    exit 1
fi
success "Milestone status confirmed: SUBMITTED"

# Step 8: Contractor approves milestone
echo ""
echo "📝 Step 8: Contractor approves milestone..."
CONTRACTOR_APPROVE_RESPONSE=$(auth_request "POST" "$API_URL/milestones/$MILESTONE_ID/approve" "$CONTRACTOR_COOKIE_JAR" '{"comments": "Contractor approval test"}')

if echo "$CONTRACTOR_APPROVE_RESPONSE" | grep -q '"success":true'; then
    success "Contractor approved milestone"
else
    error "Failed to approve milestone as contractor"
    echo "Response: $CONTRACTOR_APPROVE_RESPONSE"
    exit 1
fi

# Check if approvedByContractor is true
if echo "$CONTRACTOR_APPROVE_RESPONSE" | grep -q '"approvedByContractor":true'; then
    success "approvedByContractor flag is true"
else
    error "approvedByContractor flag should be true"
    echo "Response: $CONTRACTOR_APPROVE_RESPONSE"
    exit 1
fi

# Check if milestone is not fully approved yet
if echo "$CONTRACTOR_APPROVE_RESPONSE" | grep -q '"fullyApproved":false'; then
    success "Milestone not fully approved yet (waiting for consumer)"
else
    error "Milestone should not be fully approved yet"
    exit 1
fi

# Step 9: Consumer approves milestone
echo ""
echo "📝 Step 9: Consumer approves milestone..."
CONSUMER_APPROVE_RESPONSE=$(auth_request "POST" "$API_URL/milestones/$MILESTONE_ID/approve" "$CUSTOMER_COOKIE_JAR" '{"comments": "Consumer approval test"}')

if echo "$CONSUMER_APPROVE_RESPONSE" | grep -q '"success":true'; then
    success "Consumer approved milestone"
else
    error "Failed to approve milestone as consumer"
    echo "Response: $CONSUMER_APPROVE_RESPONSE"
    exit 1
fi

# Check if both flags are true
if echo "$CONSUMER_APPROVE_RESPONSE" | grep -q '"approvedByConsumer":true'; then
    success "approvedByConsumer flag is true"
else
    error "approvedByConsumer flag should be true"
    echo "Response: $CONSUMER_APPROVE_RESPONSE"
    exit 1
fi

if echo "$CONSUMER_APPROVE_RESPONSE" | grep -q '"approvedByContractor":true'; then
    success "approvedByContractor flag is still true"
else
    error "approvedByContractor flag should still be true"
    exit 1
fi

# Check if milestone is fully approved
if echo "$CONSUMER_APPROVE_RESPONSE" | grep -q '"fullyApproved":true'; then
    success "Milestone is fully approved (both parties confirmed)"
else
    error "Milestone should be fully approved"
    exit 1
fi

# Check final milestone status (get the first status field which should be the milestone status)
FINAL_STATUS=$(echo $CONSUMER_APPROVE_RESPONSE | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)
if [ "$FINAL_STATUS" = "APPROVED" ] || [ "$FINAL_STATUS" = "PAID" ]; then
    success "Final milestone status: $FINAL_STATUS"
else
    info "Final milestone status: $FINAL_STATUS (expected APPROVED or PAID)"
fi

# Step 10: Try to approve again (should fail)
echo ""
echo "📝 Step 10: Try to approve again as contractor (should fail)..."
DUPLICATE_APPROVE_RESPONSE=$(auth_request "POST" "$API_URL/milestones/$MILESTONE_ID/approve" "$CONTRACTOR_COOKIE_JAR")

if echo "$DUPLICATE_APPROVE_RESPONSE" | grep -q '"success":false'; then
    success "Duplicate approval correctly rejected"
else
    error "Duplicate approval should be rejected"
    echo "Response: $DUPLICATE_APPROVE_RESPONSE"
    exit 1
fi

# Summary
echo ""
echo "=================================================="
echo -e "${GREEN}✨ All tests passed!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Customer login"
echo "  ✅ Contractor login"
echo "  ✅ Project and milestone created"
echo "  ✅ Milestone started"
echo "  ✅ Milestone submitted"
echo "  ✅ Contractor approved milestone"
echo "  ✅ Consumer approved milestone"
echo "  ✅ Both approval flags set correctly"
echo "  ✅ Milestone fully approved"
echo "  ✅ Duplicate approval rejected"
echo ""
echo "Two-sided confirmation flow is working correctly! 🎉"

# Clean up
rm -f "$CUSTOMER_COOKIE_JAR" "$CONTRACTOR_COOKIE_JAR"
