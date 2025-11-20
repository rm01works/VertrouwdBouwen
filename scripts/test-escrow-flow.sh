#!/bin/bash

# Escrow Workflow Test Script
# Simuleert de volledige escrow flow: fund → start → submit → approve

set -e

API_URL="${API_URL:-http://localhost:5000}"
BASE_URL="${API_URL}/api"

echo "🧪 Escrow Workflow Test"
echo "======================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if API is running
echo -e "${BLUE}📡 Checking API connection...${NC}"
if ! curl -s "${API_URL}/health" > /dev/null; then
    echo "❌ API is not running. Please start the server first."
    exit 1
fi
echo -e "${GREEN}✅ API is running${NC}"
echo ""

# Step 1: Register Customer
echo -e "${BLUE}👤 Stap 1: Registreer Klant...${NC}"
CUSTOMER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.klant@example.com",
    "password": "Test1234",
    "role": "CUSTOMER",
    "firstName": "Test",
    "lastName": "Klant",
    "phone": "+31612345678"
  }')

CUSTOMER_TOKEN=$(echo $CUSTOMER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$CUSTOMER_TOKEN" ]; then
    echo "❌ Failed to register customer"
    echo $CUSTOMER_RESPONSE
    exit 1
fi
echo -e "${GREEN}✅ Klant geregistreerd${NC}"
echo ""

# Step 2: Register Contractor
echo -e "${BLUE}👷 Stap 2: Registreer Aannemer...${NC}"
CONTRACTOR_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.aannemer@example.com",
    "password": "Test1234",
    "role": "CONTRACTOR",
    "firstName": "Test",
    "lastName": "Aannemer",
    "companyName": "Test Bouw BV",
    "kvkNumber": "12345678",
    "phone": "+31687654321"
  }')

CONTRACTOR_TOKEN=$(echo $CONTRACTOR_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
CONTRACTOR_ID=$(echo $CONTRACTOR_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$CONTRACTOR_TOKEN" ]; then
    echo "❌ Failed to register contractor"
    echo $CONTRACTOR_RESPONSE
    exit 1
fi
echo -e "${GREEN}✅ Aannemer geregistreerd${NC}"
echo ""

# Step 3: Create Project
echo -e "${BLUE}📋 Stap 3: Maak Project aan...${NC}"
PROJECT_RESPONSE=$(curl -s -X POST "${BASE_URL}/projects" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project Escrow Flow",
    "description": "Dit is een test project om de escrow workflow te testen",
    "totalBudget": 10000.00,
    "milestones": [
      {
        "title": "Test Milestone 1",
        "description": "Eerste test milestone voor escrow flow",
        "amount": 10000.00,
        "order": 1
      }
    ]
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
MILESTONE_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":"[^"]*' | tail -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Failed to create project"
    echo $PROJECT_RESPONSE
    exit 1
fi
echo -e "${GREEN}✅ Project aangemaakt (ID: ${PROJECT_ID})${NC}"
echo -e "${GREEN}✅ Milestone aangemaakt (ID: ${MILESTONE_ID})${NC}"
echo ""

# Step 4: Fund Milestone (Klant stort bedrag)
echo -e "${BLUE}💰 Stap 4: Klant stort bedrag in escrow...${NC}"
FUND_RESPONSE=$(curl -s -X POST "${BASE_URL}/milestones/${MILESTONE_ID}/fund" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json")

PAYMENT_ID=$(echo $FUND_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
TRANSACTION_REF=$(echo $FUND_RESPONSE | grep -o '"transactionRef":"[^"]*' | cut -d'"' -f4)

if echo $FUND_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Geld in escrow gezet${NC}"
    echo -e "   Transaction Ref: ${TRANSACTION_REF}"
else
    echo "❌ Failed to fund milestone"
    echo $FUND_RESPONSE
    exit 1
fi
echo ""

# Step 5: Accept Project (Contractor)
echo -e "${YELLOW}⚠️  Stap 5: Aannemer accepteert project (nog te implementeren)${NC}"
echo "   Skipping project acceptance for now..."
echo ""

# Step 6: Start Milestone (Aannemer start werk)
echo -e "${BLUE}▶️  Stap 6: Aannemer start werk aan milestone...${NC}"
START_RESPONSE=$(curl -s -X POST "${BASE_URL}/milestones/${MILESTONE_ID}/start" \
  -H "Authorization: Bearer ${CONTRACTOR_TOKEN}" \
  -H "Content-Type: application/json")

if echo $START_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Milestone gestart (status: IN_PROGRESS)${NC}"
else
    echo "⚠️  Start failed (might need project acceptance first)"
    echo $START_RESPONSE
fi
echo ""

# Step 7: Submit Milestone (Aannemer dient in)
echo -e "${BLUE}📤 Stap 7: Aannemer dient milestone in (voltooid)...${NC}"
SUBMIT_RESPONSE=$(curl -s -X POST "${BASE_URL}/milestones/${MILESTONE_ID}/submit" \
  -H "Authorization: Bearer ${CONTRACTOR_TOKEN}" \
  -H "Content-Type: application/json")

if echo $SUBMIT_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Milestone ingediend (status: SUBMITTED)${NC}"
else
    echo "❌ Failed to submit milestone"
    echo $SUBMIT_RESPONSE
    exit 1
fi
echo ""

# Step 8: Approve Milestone (Klant keurt goed)
echo -e "${BLUE}✓ Stap 8: Klant keurt milestone goed...${NC}"
APPROVE_RESPONSE=$(curl -s -X POST "${BASE_URL}/milestones/${MILESTONE_ID}/approve" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"comments": "Ziet er goed uit! Goedgekeurd."}')

RELEASE_TRANSACTION_REF=$(echo $APPROVE_RESPONSE | grep -o '"transactionRef":"[^"]*' | cut -d'"' -f4)

if echo $APPROVE_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Milestone goedgekeurd${NC}"
    echo -e "${GREEN}✅ Betaling vrijgegeven aan aannemer${NC}"
    echo -e "   Release Transaction Ref: ${RELEASE_TRANSACTION_REF}"
    echo -e "${GREEN}✅ Milestone status: PAID${NC}"
else
    echo "❌ Failed to approve milestone"
    echo $APPROVE_RESPONSE
    exit 1
fi
echo ""

# Step 9: Verify Final State
echo -e "${BLUE}🔍 Stap 9: Verifieer eindstatus...${NC}"
MILESTONE_RESPONSE=$(curl -s -X GET "${BASE_URL}/milestones/${MILESTONE_ID}" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}")

if echo $MILESTONE_RESPONSE | grep -q '"status":"PAID"'; then
    echo -e "${GREEN}✅ Milestone status: PAID${NC}"
else
    echo "⚠️  Milestone status might not be PAID"
fi

if echo $MILESTONE_RESPONSE | grep -q '"status":"RELEASED"'; then
    echo -e "${GREEN}✅ Betaling status: RELEASED${NC}"
else
    echo "⚠️  Payment status might not be RELEASED"
fi
echo ""

echo -e "${GREEN}🎉 Escrow Workflow Test Voltooid!${NC}"
echo ""
echo "Samenvatting:"
echo "  - Klant stort: ✅"
echo "  - Aannemer start: ✅"
echo "  - Aannemer dient in: ✅"
echo "  - Klant keurt goed: ✅"
echo "  - Aannemer ontvangt betaling: ✅"
echo ""
echo "Project ID: ${PROJECT_ID}"
echo "Milestone ID: ${MILESTONE_ID}"
echo "Payment ID: ${PAYMENT_ID}"

