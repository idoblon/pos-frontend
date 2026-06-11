# PERMANENT FIX: Registration to Store Data Mapping

## 🎯 Backend Changes Required

### 1. Update Store Model Schema

The Store model needs to include ALL registration fields:

```javascript
// Store.js (Backend Model)
const StoreSchema = new mongoose.Schema({
  // Basic store information
  storeName: { type: String, required: true },
  storeDescription: String,
  storeType: String,
  storeAddress: { type: String, required: true },
  
  // Owner information (from registration)
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Subscription information (CRITICAL!)
  subscriptionPlan: { 
    type: String, 
    enum: ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'],
    required: true 
  },
  estimatedBranches: { type: Number, default: 1 },
  estimatedUsers: { type: Number, default: 1 },
  
  // Status and metadata
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'],
    default: 'ACTIVE' 
  },
  
  // Audit fields
  createdAt: { type: Date, default: Date.now },
  approvedAt: Date,
  registrationRequestId: String,
  
  // Keep original registration data for reference
  registrationData: {
    ownerName: String,
    email: String,
    phone: String,
    storeAddress: String,
    subscriptionPlan: String,
    estimatedBranches: Number,
    estimatedUsers: Number,
    submittedAt: Date
  },
  
  // Revenue tracking
  totalRevenue: { type: Number, default: 0 },
  
  // Relationships
  branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
```

### 2. Update Approval Endpoint

**File:** `controllers/adminController.js`

```javascript
// POST /api/admin/registration-requests/:id/approve-final
const approveFinalRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch the complete registration request
    const registrationRequest = await RegistrationRequest.findById(id);
    if (!registrationRequest) {
      return res.status(404).json({ message: 'Registration request not found' });
    }
    
    // 2. Create store with ALL registration data mapped
    const storeData = {
      // Basic store info
      storeName: registrationRequest.storeName,
      storeDescription: registrationRequest.storeDescription,
      storeType: registrationRequest.storeType,
      storeAddress: registrationRequest.storeAddress,
      
      // Owner info (CRITICAL - these were missing!)
      ownerName: registrationRequest.ownerName,
      email: registrationRequest.email,
      phone: registrationRequest.phone,
      
      // Subscription info (CRITICAL - this was missing!)
      subscriptionPlan: registrationRequest.subscriptionPlan,
      estimatedBranches: registrationRequest.estimatedBranches || 1,
      estimatedUsers: registrationRequest.estimatedUsers || 1,
      
      // Status and audit
      status: 'ACTIVE',
      createdAt: new Date(),
      approvedAt: new Date(),
      registrationRequestId: registrationRequest._id,
      
      // Revenue (start with 0 for new stores)
      totalRevenue: 0,
      
      // Store original registration data for reference
      registrationData: {
        ownerName: registrationRequest.ownerName,
        email: registrationRequest.email,
        phone: registrationRequest.phone,
        storeAddress: registrationRequest.storeAddress,
        subscriptionPlan: registrationRequest.subscriptionPlan,
        estimatedBranches: registrationRequest.estimatedBranches,
        estimatedUsers: registrationRequest.estimatedUsers,
        submittedAt: registrationRequest.createdAt
      }
    };
    
    // 3. Create the store
    const store = await Store.create(storeData);
    
    // 4. Create admin user account for the store owner
    const adminUser = await User.create({
      fullName: registrationRequest.ownerName,
      email: registrationRequest.email,
      phone: registrationRequest.phone,
      password: await bcrypt.hash(generateRandomPassword(), 12),
      role: 'STORE_ADMIN',
      storeId: store._id,
      isActive: true
    });
    
    // 5. Update registration request status
    registrationRequest.status = 'APPROVED';
    registrationRequest.approvedAt = new Date();
    registrationRequest.storeId = store._id;
    await registrationRequest.save();
    
    // 6. Send success email with login credentials
    await emailService.sendApprovalEmail({
      email: registrationRequest.email,
      storeName: registrationRequest.storeName,
      ownerName: registrationRequest.ownerName,
      loginUrl: process.env.FRONTEND_URL + '/login',
      tempPassword: adminUser.tempPassword // if using temp passwords
    });
    
    res.status(201).json({
      message: 'Store approved and created successfully',
      store: {
        id: store._id,
        storeName: store.storeName,
        ownerName: store.ownerName,
        email: store.email,
        subscriptionPlan: store.subscriptionPlan,
        status: store.status
      }
    });
    
  } catch (error) {
    console.error('Store approval error:', error);
    res.status(500).json({ 
      message: 'Failed to approve store registration',
      error: error.message 
    });
  }
};
```

### 3. Update Get Stores Endpoint

Ensure the stores endpoint returns ALL the required data:

```javascript
// GET /api/stores
const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate('branches', 'name address')
      .populate('employees', 'fullName role')
      .select(`
        _id storeName storeDescription storeType storeAddress
        ownerName email phone subscriptionPlan estimatedBranches estimatedUsers
        status createdAt approvedAt totalRevenue registrationData
      `)
      .sort({ createdAt: -1 });
    
    // Calculate real-time revenue for each store
    const storesWithRevenue = await Promise.all(stores.map(async (store) => {
      // Calculate real revenue from orders
      const totalRevenue = await Order.aggregate([
        { $match: { storeId: store._id, status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      
      return {
        ...store.toObject(),
        totalRevenue: totalRevenue[0]?.total || 0,
        branches: store.branches,
        employees: store.employees
      };
    }));
    
    res.json(storesWithRevenue);
    
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
};
```

### 4. Revenue Calculation Service

Create a service for real-time revenue calculation:

```javascript
// services/revenueService.js
const calculateStoreRevenue = async (storeId) => {
  try {
    // Sum all completed orders for the store
    const result = await Order.aggregate([
      { 
        $match: { 
          storeId: new mongoose.Types.ObjectId(storeId),
          status: 'COMPLETED' 
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        } 
      }
    ]);
    
    return {
      totalRevenue: result[0]?.totalRevenue || 0,
      orderCount: result[0]?.orderCount || 0
    };
  } catch (error) {
    console.error('Revenue calculation error:', error);
    return { totalRevenue: 0, orderCount: 0 };
  }
};

// Update store revenue periodically
const updateStoreRevenue = async (storeId) => {
  const { totalRevenue } = await calculateStoreRevenue(storeId);
  await Store.findByIdAndUpdate(storeId, { totalRevenue });
  return totalRevenue;
};

module.exports = { calculateStoreRevenue, updateStoreRevenue };
```

## 🔧 Frontend Updates

### Remove Temporary Fix and Use Real Data

Update the subscription management to use real backend data:

```javascript
// Remove the temporary merger and use actual backend data
const transformStoreDataToSubscriptions = (storesToTransform = stores) => {
  if (!storesToTransform || storesToTransform.length === 0) return;

  const subscriptions = storesToTransform.map((store) => {
    // All data should now come directly from backend
    return {
      id: store._id || store.id,
      storeName: store.storeName,
      storeId: store._id || store.id,
      plan: store.subscriptionPlan, // Direct from backend
      status: getSubscriptionStatus(store.status),
      startDate: store.createdAt ? store.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: calculateExpiryDate(store.createdAt),
      totalRevenue: store.totalRevenue || 0, // Real-time revenue from backend
      branches: store.branches?.length || store.estimatedBranches || 1,
      users: store.employees?.length || store.estimatedUsers || 1,
      
      // Contact info directly from store record
      storeAddress: store.storeAddress,
      storePhone: store.phone,
      storeEmail: store.email,
      adminName: store.ownerName
    };
  });

  setSubscriptionData(subscriptions);
};
```

## 🧪 Testing Checklist

### Backend Testing:
1. **Registration Flow:**
   ```bash
   # Create registration request
   POST /api/public/store-registration-request
   {
     "storeName": "Test Store",
     "ownerName": "Test Owner",
     "email": "test@example.com",
     "phone": "1234567890",
     "storeAddress": "Test Address",
     "subscriptionPlan": "PROFESSIONAL"
   }
   ```

2. **Approval Flow:**
   ```bash
   # Approve registration
   POST /api/admin/registration-requests/{id}/approve-final
   ```

3. **Verify Store Data:**
   ```bash
   # Get stores and verify all fields present
   GET /api/stores
   
   # Expected response should include:
   {
     "_id": "...",
     "storeName": "Test Store",
     "ownerName": "Test Owner", 
     "email": "test@example.com",
     "phone": "1234567890",
     "storeAddress": "Test Address",
     "subscriptionPlan": "PROFESSIONAL",
     "totalRevenue": 0
   }
   ```

### Frontend Testing:
1. Open subscription management
2. Verify store shows:
   - Correct subscription plan
   - Real contact information
   - Accurate revenue (0 for new stores)

## 🚀 Implementation Priority

1. **High Priority:** Update Store model schema
2. **High Priority:** Fix approval endpoint data mapping  
3. **Medium Priority:** Implement real-time revenue calculation
4. **Low Priority:** Add revenue update webhooks/cron jobs

This permanent fix ensures that approved stores contain all the original registration data and display accurate information in the subscription management system.