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

    console.log("🚀 Creating POS Admin user...");
    console.log("📧 Email:", POS_ADMIN_CREDENTIALS.email);
    console.log("🔑 Password:", POS_ADMIN_CREDENTIALS.password);
    console.log("🎭 Role:", POS_ADMIN_CREDENTIALS.role);
    const response = await api.post("/auth/signup", adminData);
    
    if (response.data) {
      console.log("✅ POS Admin user created successfully!");
      console.log("📧 Email:", POS_ADMIN_CREDENTIALS.email);
      console.log("🔑 Password:", POS_ADMIN_CREDENTIALS.password);
      console.log("🎭 Role:", POS_ADMIN_CREDENTIALS.role);
      console.log("📊 Admin Dashboard: /admin");
      return response.data;
    }
  } catch (error) {
    if (error.response?.status === 409 || error.response?.data?.message?.includes("already exists")) {
      console.log("ℹ️  POS Admin user already exists!");
      console.log("📧 Email:", POS_ADMIN_CREDENTIALS.email);
      console.log("🔑 Password:", POS_ADMIN_CREDENTIALS.password);
      return { message: "User already exists" };
    } else {
      console.error("❌ Failed to create POS Admin user:", error.response?.data?.message || error.message);
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
    console.log("🔧 Creating admin user via direct API...");
    
    // Try to create user directly if there's a dedicated admin endpoint
    const response = await api.post("/admin/users", userData);
    console.log("✅ Admin user created via admin API!");
    return response.data;
  } catch (error) {
    console.log("ℹ️  Admin API not available, using signup endpoint...");
    // Fallback to signup if admin endpoint doesn't exist
    return await createPosAdmin();
  }
};

export default {
  POS_ADMIN_CREDENTIALS,
  createPosAdmin,
  createAdminUser
};