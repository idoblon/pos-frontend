import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getStoresWithSubscriptions = createAsyncThunk(
  "/subscription/getStoresWithSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      
      // First get all stores
      const storesRes = await api.get(`/api/stores`, { headers });
      const stores = storesRes.data;

      // Transform store data to include subscription information
      const storesWithSubscriptions = stores.map((store) => {
        // Generate subscription data based on store characteristics
        const getSubscriptionStatus = (store) => {
          if (!store.status) return "ACTIVE";
          
          switch (store.status.toLowerCase()) {
            case "active":
              return "ACTIVE";
            case "inactive":
            case "suspended":
              return "SUSPENDED"; 
            default:
              return "ACTIVE";
          }
        };

        const getSubscriptionPlan = (store) => {
          // Assign plans based on store size/characteristics
          const employeeCount = store.employees?.length || 0;
          const branchCount = store.branches?.length || 1;
          
          if (employeeCount > 50 || branchCount > 10) {
            return "ENTERPRISE";
          } else if (employeeCount > 15 || branchCount > 3) {
            return "PROFESSIONAL";
          }
          return "BASIC";
        };

        const generateSubscriptionDates = () => {
          const today = new Date();
          const startDate = store.createdAt ? new Date(store.createdAt) : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          const expiryDate = new Date(today);
          
          // Add variation for expiry dates
          const variation = Math.random() * 60 - 15; // -15 to +45 days
          expiryDate.setDate(today.getDate() + variation);
          
          const lastPayment = new Date(today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
          const nextPayment = new Date(expiryDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before expiry
          
          return {
            startDate: startDate.toISOString().split('T')[0],
            expiryDate: expiryDate.toISOString().split('T')[0],
            lastPayment: lastPayment.toISOString().split('T')[0],
            nextPayment: nextPayment.toISOString().split('T')[0]
          };
        };

        const subscriptionDates = generateSubscriptionDates();
        const plan = getSubscriptionPlan(store);
        const status = getSubscriptionStatus(store);

        // Determine if subscription is expiring soon
        const daysUntilExpiry = Math.ceil((new Date(subscriptionDates.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        const finalStatus = daysUntilExpiry <= 7 && daysUntilExpiry > 0 && status === "ACTIVE" ? "EXPIRING_SOON" : status;

        return {
          ...store,
          subscription: {
            id: `SUB_${store._id || store.id}`,
            plan,
            status: finalStatus,
            ...subscriptionDates,
            monthlyRevenue: Math.floor(Math.random() * 150000) + 20000,
            totalRevenue: Math.floor(Math.random() * 500000) + 100000,
            planDetails: {
              BASIC: { name: "Basic", price: 2999, maxBranches: 3, maxUsers: 10 },
              PROFESSIONAL: { name: "Professional", price: 5999, maxBranches: 10, maxUsers: 50 },
              ENTERPRISE: { name: "Enterprise", price: 12999, maxBranches: -1, maxUsers: -1 }
            }[plan]
          }
        };
      });

      return storesWithSubscriptions;
    } catch (error) {
      console.error("Failed to fetch stores with subscriptions:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stores with subscriptions");
    }
  }
);

export const updateStoreSubscription = createAsyncThunk(
  "/subscription/updateStoreSubscription",
  async ({ storeId, subscriptionData }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      
      // This would be your subscription update API endpoint
      // For now, we'll simulate the update
      const res = await api.put(
        `/api/stores/${storeId}/subscription`,
        subscriptionData,
        { headers }
      );
      
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update subscription");
    }
  }
);

export const validateStoreSubscription = createAsyncThunk(
  "/subscription/validateStoreSubscription", 
  async ({ storeId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      
      // Validate subscription status and payment
      const res = await api.get(`/api/stores/${storeId}/subscription/validate`, { headers });
      
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to validate subscription");
    }
  }
);