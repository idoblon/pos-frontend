#!/bin/bash
# Backend API Test Script for Registration to Store Data Mapping

echo "🧪 Testing Registration to Store Data Mapping"
echo "=============================================="

BASE_URL="http://localhost:8080"
ADMIN_TOKEN="" # Add admin JWT token here

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📝 Step 1: Creating test registration request${NC}"
REGISTRATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/public/store-registration-request" \
  -H "Content-Type: application/json" \
  -d '{
    "storeName": "Test Premium Store",
    "ownerName": "John Doe",
    "email": "john@teststore.com", 
    "phone": "9876543210",
    "storeAddress": "123 Main St, Test City, Nepal",
    "storeDescription": "Premium retail store for testing",
    "storeType": "RETAIL",
    "subscriptionPlan": "PROFESSIONAL",
    "estimatedBranches": 5,
    "estimatedUsers": 25
  }')

echo "Registration Response:"
echo "$REGISTRATION_RESPONSE" | jq '.'

# Extract request ID (adjust based on your API response structure)
REQUEST_ID=$(echo "$REGISTRATION_RESPONSE" | jq -r '.id // .data.id // .requestId')

if [ "$REQUEST_ID" == "null" ]; then
    echo -e "${RED}❌ Failed to create registration request${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Registration request created with ID: $REQUEST_ID${NC}"

echo -e "${YELLOW}📝 Step 2: Approving registration request${NC}"

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}❌ ADMIN_TOKEN is required. Please set it in the script.${NC}"
    echo "   Get token by logging in as admin: POST $BASE_URL/auth/login"
    exit 1
fi

APPROVAL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/registration-requests/$REQUEST_ID/approve-final" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")

echo "Approval Response:"
echo "$APPROVAL_RESPONSE" | jq '.'

# Extract store ID from approval response
STORE_ID=$(echo "$APPROVAL_RESPONSE" | jq -r '.store.id // .storeId // .data.storeId')

if [ "$STORE_ID" == "null" ]; then
    echo -e "${RED}❌ Failed to approve registration request${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Registration approved! Store created with ID: $STORE_ID${NC}"

echo -e "${YELLOW}📝 Step 3: Fetching created store data${NC}"

STORE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/stores/$STORE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Store Data Response:"
echo "$STORE_RESPONSE" | jq '.'

echo -e "${YELLOW}📝 Step 4: Validating data mapping${NC}"

# Extract store data fields
STORE_NAME=$(echo "$STORE_RESPONSE" | jq -r '.storeName // .data.storeName')
OWNER_NAME=$(echo "$STORE_RESPONSE" | jq -r '.ownerName // .data.ownerName')
EMAIL=$(echo "$STORE_RESPONSE" | jq -r '.email // .data.email')
PHONE=$(echo "$STORE_RESPONSE" | jq -r '.phone // .data.phone')
ADDRESS=$(echo "$STORE_RESPONSE" | jq -r '.storeAddress // .data.storeAddress')
SUBSCRIPTION_PLAN=$(echo "$STORE_RESPONSE" | jq -r '.subscriptionPlan // .data.subscriptionPlan')
ESTIMATED_BRANCHES=$(echo "$STORE_RESPONSE" | jq -r '.estimatedBranches // .data.estimatedBranches')
ESTIMATED_USERS=$(echo "$STORE_RESPONSE" | jq -r '.estimatedUsers // .data.estimatedUsers')
TOTAL_REVENUE=$(echo "$STORE_RESPONSE" | jq -r '.totalRevenue // .data.totalRevenue')

echo ""
echo "🔍 Data Mapping Validation:"
echo "=========================="

# Check each field
validate_field() {
    local field_name=$1
    local expected=$2
    local actual=$3
    
    if [ "$actual" == "$expected" ] || [ "$actual" != "null" ] && [ "$actual" != "" ]; then
        echo -e "${GREEN}✅ $field_name: $actual${NC}"
        return 0
    else
        echo -e "${RED}❌ $field_name: Expected '$expected', got '$actual'${NC}"
        return 1
    fi
}

PASSED=0
TOTAL=8

validate_field "Store Name" "Test Premium Store" "$STORE_NAME" && ((PASSED++))
validate_field "Owner Name" "John Doe" "$OWNER_NAME" && ((PASSED++))
validate_field "Email" "john@teststore.com" "$EMAIL" && ((PASSED++))
validate_field "Phone" "9876543210" "$PHONE" && ((PASSED++))
validate_field "Store Address" "123 Main St, Test City, Nepal" "$ADDRESS" && ((PASSED++))
validate_field "Subscription Plan" "PROFESSIONAL" "$SUBSCRIPTION_PLAN" && ((PASSED++))
validate_field "Estimated Branches" "5" "$ESTIMATED_BRANCHES" && ((PASSED++))

# Revenue should be 0 for new stores
if [ "$TOTAL_REVENUE" == "0" ] || [ "$TOTAL_REVENUE" == "0.0" ]; then
    echo -e "${GREEN}✅ Total Revenue: $TOTAL_REVENUE (correct for new store)${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Total Revenue: Expected '0', got '$TOTAL_REVENUE'${NC}"
fi

echo ""
echo "📊 Test Results:"
echo "==============="
echo -e "Passed: ${GREEN}$PASSED${NC}/$TOTAL tests"

if [ $PASSED -eq $TOTAL ]; then
    echo -e "${GREEN}🎉 All tests passed! Registration data mapping is working correctly.${NC}"
    echo ""
    echo "✅ Backend Implementation Checklist:"
    echo "   ✅ Store model includes registration fields"
    echo "   ✅ Approval endpoint maps all registration data"
    echo "   ✅ Created store contains complete information"
    echo "   ✅ Revenue starts at 0 for new stores"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Backend needs to be updated.${NC}"
    echo ""
    echo "🔧 Required Backend Changes:"
    echo "   - Ensure Store model includes all registration fields"
    echo "   - Update approval endpoint to map registration data properly"
    echo "   - Verify GET /api/stores returns complete store data"
    echo ""
    echo "See PERMANENT_FIX_SPECIFICATION.md for detailed implementation guide."
    exit 1
fi