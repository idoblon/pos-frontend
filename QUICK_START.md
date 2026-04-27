# POS Frontend - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- Backend running on `http://localhost:8080`
- MySQL database configured

### Installation
```bash
cd pos-frontend
npm install
npm run dev
```

The app will run on `http://localhost:5173`

---

## 🔑 Default Login Credentials

Based on backend setup, use these test accounts:

### Super Admin
- Email: `admin@pos.com`
- Password: `admin123`
- Access: System-wide management

### Store Admin
- Email: `store@pos.com`
- Password: `store123`
- Access: Store management

### Branch Manager
- Email: `manager@pos.com`
- Password: `manager123`
- Access: Branch operations

### Cashier
- Email: `cashier@pos.com`
- Password: `cashier123`
- Access: POS terminal

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ProtectedRoute.jsx
│   └── SystemStatus.jsx
├── context/            # React Context providers
│   ├── AuthContext.jsx
│   └── SidebarProvider.jsx
├── pages/              # Page components
│   ├── Auth/          # Login/Signup
│   ├── cashier/       # POS Terminal
│   ├── store/         # Store Management
│   ├── branch/        # Branch Management
│   └── superAdmin/    # System Admin
├── Redux Toolkit/      # State management
│   └── Features/      # Redux slices & thunks
├── routes/            # Route configurations
├── util/              # Utilities & API config
└── App.jsx            # Main app component
```

---

## 🔄 Key Workflows

### 1. Authentication Flow
```
Login → JWT stored → getUserProfile → Role-based redirect
```

### 2. POS Order Flow
```
Browse Products → Add to Cart → Select Customer → 
Apply Discount → Choose Payment → Confirm Order
```

### 3. Inventory Management
```
Store Admin creates Product → 
Branch Manager adds to Inventory → 
Cashier sells from Inventory
```

### 4. Shift Management
```
Cashier starts shift → Process orders → 
View shift summary → End shift & logout
```

---

## 🎨 UI Components

### Using shadcn/ui
All UI components are from shadcn/ui:
- Button, Card, Dialog, Input, Label
- Select, Table, Textarea, etc.

### Adding New Components
```bash
npx shadcn-ui@latest add [component-name]
```

---

## 🔌 API Integration

### Base URL
```javascript
// src/util/api.js
baseURL: "http://localhost:8080/api"
```

### Making API Calls
```javascript
// Use Redux thunks
import { getProductsByStore } from '@/Redux Toolkit/Features/Product/productThunk';

dispatch(getProductsByStore(storeId));
```

### Auth Headers
```javascript
import { getAuthHeaders } from '@/util/getAuthHeader';

const headers = getAuthHeaders(); // Includes JWT token
```

---

## 🛠️ Common Tasks

### Add New Redux Feature
1. Create slice in `Redux Toolkit/Features/[Feature]/`
2. Create thunks for API calls
3. Add reducer to `globalStore.js`
4. Use in components with `useSelector` and `useDispatch`

### Add New Route
1. Create page component in `src/pages/`
2. Add route to appropriate route file
3. Update `ProtectedRoute` if needed

### Add New UI Component
1. Use shadcn/ui: `npx shadcn-ui@latest add [component]`
2. Or create custom in `src/components/`

---

## 🐛 Debugging Tips

### Check Redux State
```javascript
// In component
const state = useSelector((s) => s);
console.log('Full state:', state);
```

### Check Auth Status
```javascript
const { user, isAuthenticated, userRole } = useAuth();
console.log({ user, isAuthenticated, userRole });
```

### Check API Calls
- Open browser DevTools → Network tab
- Filter by XHR
- Check request/response

### Common Issues

**Issue: "No JWT token found"**
- Solution: Login again, check localStorage for 'jwt' key

**Issue: "403 Forbidden"**
- Solution: Check user role matches route requirements

**Issue: "Cannot read property of undefined"**
- Solution: Add null-safe access (`?.`) or check loading state

**Issue: Double `/api` in URL**
- Solution: Remove `/api` prefix from thunk (baseURL already has it)

---

## 📦 Dependencies

### Core
- React 18
- React Router DOM
- Redux Toolkit
- Axios

### UI
- Tailwind CSS
- shadcn/ui
- Lucide React (icons)
- Sonner (toasts)

### Dev
- Vite
- ESLint

---

## 🔐 Security Notes

- JWT tokens stored in localStorage
- Protected routes check authentication + role
- API calls include Authorization header
- Passwords never stored in frontend

---

## 📊 State Management

### Global State (Redux)
- auth: Authentication state
- user: User profile & lists
- order: Orders data
- product: Products catalog
- inventory: Stock levels
- customer: Customer data
- category: Product categories
- store: Store information
- branch: Branch information
- employee: Employee data
- refund: Refund records
- shiftReport: Shift data
- storeAnalytics: Analytics data

### Local State (React)
- Form inputs
- UI toggles (modals, drawers)
- Search queries
- Filters

---

## 🎯 Next Steps

1. **Test all workflows** with backend running
2. **Add error boundaries** for production
3. **Implement loading skeletons** for better UX
4. **Add form validation** with react-hook-form
5. **Implement real-time updates** with WebSockets
6. **Add print functionality** for receipts
7. **Implement offline mode** with service workers
8. **Add analytics tracking**

---

## 📞 Support

For issues or questions:
1. Check `FIXES_AND_IMPLEMENTATIONS.md` for detailed fixes
2. Review backend API documentation
3. Check browser console for errors
4. Verify backend is running and accessible

---

**Happy Coding! 🚀**
