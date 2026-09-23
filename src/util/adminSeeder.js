import api from "./api";

/**
 * POS System Admin Configuration
 * Credentials MUST come from environment for any non-dev use. Hardcoded
 * defaults were removed so the seeder cannot mint a known-password admin.
 * Set VITE_SEED_ADMIN_{EMAIL,PASSWORD,NAME} locally for first-run setup only.
 */
const isSeederEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN_SEEDER === "true";

export const POS_ADMIN_CREDENTIALS = {
  email: import.meta.env.VITE_SEED_ADMIN_EMAIL || "",
  password: "",
  fullName: import.meta.env.VITE_SEED_ADMIN_NAME || "POS Super Admin",
  role: "ROLE_ADMIN"
};

// Only expose the password value in dev memory; never render it in prod UI.
const getSeedPassword = () =>
  import.meta.env.DEV ? import.meta.env.VITE_SEED_ADMIN_PASSWORD || "" : "";

/**
 * Seeds the POS admin user into the system
 * Disabled in production builds unless VITE_ENABLE_ADMIN_SEEDER=true.
 */
export const createPosAdmin = async () => {
  if (!isSeederEnabled) {
    throw new Error("Admin seeder is disabled in this environment.");
  }
  const password = getSeedPassword();
  if (!POS_ADMIN_CREDENTIALS.email || !password) {
    throw new Error(
      "Seed admin credentials are not configured. Set VITE_SEED_ADMIN_EMAIL and VITE_SEED_ADMIN_PASSWORD."
    );
  }
  try {
    const adminData = {
      fullName: POS_ADMIN_CREDENTIALS.fullName,
      email: POS_ADMIN_CREDENTIALS.email,
      password,
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
  if (!isSeederEnabled) {
    throw new Error("Admin seeder is disabled in this environment.");
  }
  const defaultAdminData = {
    fullName: POS_ADMIN_CREDENTIALS.fullName,
    email: POS_ADMIN_CREDENTIALS.email,
    password: getSeedPassword(),
    role: POS_ADMIN_CREDENTIALS.role,
    phone: "+1234567890"
  };

  const userData = adminUserData || defaultAdminData;
  
  try {
    // Try to create user directly if there's a dedicated admin endpoint
    const response = await api.post("/admin/users", userData);
    return response.data;
  } catch {
    // Fallback to signup if admin endpoint doesn't exist
    return await createPosAdmin();
  }
};

export default {
  POS_ADMIN_CREDENTIALS,
  createPosAdmin,
  createAdminUser
};
