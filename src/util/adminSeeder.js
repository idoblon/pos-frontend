import api from "./api";

/**
 * POS System Admin Configuration
 * These are the default admin credentials for the POS system
 */
export const POS_ADMIN_CREDENTIALS = {
  email: "posproofficial@gmail.com",
  password: "Pos@123#!",
  fullName: "POS Super Admin",
  role: "ROLE_ADMIN"
};

/**
 * Seeds the POS admin user into the system
 * This should be run once to create the super admin account
 */
export const createPosAdmin = async () => {
  try {
    const adminData = {
      fullName: POS_ADMIN_CREDENTIALS.fullName,
      email: POS_ADMIN_CREDENTIALS.email,
      password: POS_ADMIN_CREDENTIALS.password,
      role: POS_ADMIN_CREDENTIALS.role,
      phone: "+1234567890",
      storeName: "POS System Administration",
      storeDescription: "System administration and management",
      storeType: "RETAIL",
      storeAddress: "System Administrative Office"
    };

    const response = await api.post("/auth/signup", adminData);
    
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    if (error.response?.status === 409 || error.response?.data?.message?.includes("already exists")) {
      return { message: "User already exists" };
    } else {
      throw error;
    }
  }
};

/**
 * Creates an admin user via direct API call
 * Use this if you need to create admin without going through normal signup flow
 */
export const createAdminUser = async (adminUserData = null) => {
  const defaultAdminData = {
    fullName: POS_ADMIN_CREDENTIALS.fullName,
    email: POS_ADMIN_CREDENTIALS.email, 
    password: POS_ADMIN_CREDENTIALS.password,
    role: POS_ADMIN_CREDENTIALS.role,
    phone: "+1234567890"
  };

  const userData = adminUserData || defaultAdminData;
  
  try {
    // Try to create user directly if there's a dedicated admin endpoint
    const response = await api.post("/admin/users", userData);
    return response.data;
  } catch (error) {
    // Fallback to signup if admin endpoint doesn't exist
    return await createPosAdmin();
  }
};

export default {
  POS_ADMIN_CREDENTIALS,
  createPosAdmin,
  createAdminUser
};
