// Backend connectivity test utility
import api from "./api";
import { getAuthHeaders } from "./getAuthHeader";
import secureStorage from "./secureStorage";

export const testBackendConnectivity = async () => {
  const results = {
    baseConnection: false,
    authentication: false,
    customersEndpoint: false,
    errors: []
  };

  // Test 1: Basic connection
  try {
    await api.get("/");
    results.baseConnection = true;
    console.log("✅ Base connection successful");
  } catch (error) {
    results.errors.push(`Base connection failed: ${error.message}`);
    console.log("❌ Base connection failed:", error.message);
  }

  // Test 2: Health check
  try {
    await api.get("/api/health");
    console.log("✅ Health endpoint accessible");
  } catch (error) {
    results.errors.push(`Health check failed: ${error.message}`);
    console.log("❌ Health endpoint failed:", error.message);
  }

  // Test 3: Authentication status
  const token = secureStorage.getToken();
  const isTokenValid = secureStorage.isTokenValid();
  
  if (token && isTokenValid) {
    results.authentication = true;
    console.log("✅ Authentication token is valid");
  } else {
    results.errors.push("No valid authentication token found");
    console.log("❌ No valid authentication token");
  }

  // Test 4: Customers endpoint
  if (results.authentication) {
    try {
      const headers = getAuthHeaders();
      const response = await api.get("/api/customers", { headers });
      results.customersEndpoint = true;
      console.log("✅ Customers endpoint accessible:", response.data);
    } catch (error) {
      results.errors.push(`Customers endpoint failed: ${error.response?.status} ${error.response?.statusText}`);
      console.log("❌ Customers endpoint failed:", error.response?.status, error.response?.data);
    }
  }

  return results;
};

export const logBackendStatus = async () => {
  console.log("🔍 Testing backend connectivity...");
  const results = await testBackendConnectivity();
  
  console.log("📊 Backend Test Results:");
  console.log("- Base Connection:", results.baseConnection ? "✅" : "❌");
  console.log("- Authentication:", results.authentication ? "✅" : "❌");
  console.log("- Customers Endpoint:", results.customersEndpoint ? "✅" : "❌");
  
  if (results.errors.length > 0) {
    console.log("🚨 Errors:");
    results.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  return results;
};