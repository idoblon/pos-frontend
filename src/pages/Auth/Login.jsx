import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import posLogo from "@/logo/pos.png";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/Redux Toolkit/Features/auth/authThunk";
import { useNavigate, Link } from "react-router-dom";
import { sanitizeInput, validateEmail } from "@/util/inputValidator";
import { mapToBackendRole } from "@/util/roleMapper";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { startShift } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    setFormData({ ...formData, [name]: sanitizedValue });
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      const profileResult = await dispatch(getUserProfile(result.payload.jwt));
      const role = mapToBackendRole(result.payload?.role);
      
      // Start shift for cashier on login
      if (role === 'ROLE_BRANCH_CASHIER') {
        const branchId = profileResult.payload?.branchId;
        
        if (branchId && branchId !== 'null') {
          try {
            await dispatch(startShift(branchId)).unwrap();
            console.log("✅ Shift started successfully");
          } catch (error) {
            console.warn("⚠️ Failed to start shift:", error);
            // Continue to dashboard even if shift start fails
          }
        } else {
          console.warn("⚠️ No branchId found in user profile - cannot start shift");
        }
      }
      
      switch (role) {
        case 'ROLE_ADMIN':
          navigate("/admin");
          break;
        case 'ROLE_STORE_ADMIN':
        case 'ROLE_STORE_MANAGER':
          navigate("/store-admin");
          break;
        case 'ROLE_BRANCH_MANAGER':
          navigate("/branch");
          break;
        case 'ROLE_BRANCH_CASHIER':
          navigate("/cashier");
          break;
        default:
          navigate("/dashboard");
      }
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!validateEmail(forgotPasswordEmail)) {
      alert("Please enter a valid email address");
      return;
    }
    // TODO: Implement forgot password API call
    console.log("Forgot Password:", sanitizeInput(forgotPasswordEmail));
    alert("Password reset link sent to your email (Demo mode)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src={posLogo} alt="POS" style={{ width: 32, height: 32, objectFit: "contain" }} />
            </div>
            <span className="text-2xl font-bold text-slate-800">POS Pro</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {showForgotPassword ? "Reset Password" : "Welcome Back"}
          </h1>
          <p className="text-slate-600 mt-2">
            {showForgotPassword
              ? "Enter your email to reset your password"
              : "Sign in to your account"}
          </p>
        </div>

        {!showForgotPassword && (
          <div className="bg-card rounded-2xl shadow-xl p-8">
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-3">
                <Label>Email Address</Label>
                <Input
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  type="email"
                  name="email"
                  value={formData.email}
                  required
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>
              <div className="space-y-3">
                <Label>Password</Label>
                <Input
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  type="password"
                  name="password"
                  value={formData.password}
                  required
                  className={validationErrors.password ? "border-red-500" : ""}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-500">{validationErrors.password}</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox name="remember-me" className="h-4 w-4" />
                  <Label>Remember me</Label>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  variant="ghost"
                >
                  Forgot Password
                </Button>
              </div>

              <Button className="py-4 w-full" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>

            <div className="my-6 border-t border-gray-200" />
            
            <p className="text-sm text-center text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-foreground hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        )}

        {showForgotPassword && (
          <div className="bg-card rounded-2xl shadow-xl p-8">
            <form className="space-y-5" onSubmit={handleForgotPassword}>
              <div className="space-y-3">
                <Label>Email Address</Label>
                <Input
                  onChange={(e) => setForgotPasswordEmail(sanitizeInput(e.target.value))}
                  placeholder="Enter your email"
                  type="email"
                  name="forgotPasswordEmail"
                  value={forgotPasswordEmail}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="py-4 flex-1"
                  type="button"
                >
                  Back to Login
                </Button>
                <Button className="py-4 flex-1" type="submit">
                  Send Reset Link
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
