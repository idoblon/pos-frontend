import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import posLogo from "@/logo/pos.png";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "@/Redux Toolkit/Features/auth/authThunk";
import { useNavigate, Link } from "react-router-dom";
import emailService from "@/util/emailService";

const ROLES = [
  { value: "ROLE_STORE_ADMIN", label: "Store Admin" },
];

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ROLE_STORE_ADMIN",
    storeName: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "confirmPassword" || e.target.name === "password") {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    const { confirmPassword, firstName, lastName, ...rest } = formData;
    const fullName = `${firstName} ${lastName}`.trim();
    const payload = {
      ...rest,
      fullName
    };
    
    const result = await dispatch(signup(payload));
    if (signup.fulfilled.match(result)) {
      console.log("✅ Signup successful, response:", result.payload);
      console.log("Store ID from signup:", result.payload?.storeId);
      
      // Send welcome email after successful signup
      try {
        setEmailSending(true);
        await emailService.sendAccountCreatedEmail({
          email: formData.email,
          fullName,
          storeName: formData.storeName,
          role: formData.role,
        });
        console.log("✅ Welcome email sent successfully");
      } catch (emailError) {
        console.warn("⚠️ Failed to send welcome email:", emailError);
        // Don't block navigation if email fails
      } finally {
        setEmailSending(false);
      }
      
      navigate("/login");
    } else {
      console.error("❌ Signup failed:", result);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src={posLogo} alt="POS" style={{ width: 32, height: 32, objectFit: "contain" }} />
            </div>
            <span className="text-2xl font-bold text-slate-800">POS Pro</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create Store Account</h1>
          <p className="text-slate-600 mt-2">Register as a Store Admin to get started</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Store Name</Label>
              <Input
                name="storeName"
                placeholder="e.g. Indoor Plant World"
                value={formData.storeName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Confirm Password</Label>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {(passwordError || error) && (
              <p className="text-sm text-red-500 text-center">
                {passwordError || error}
              </p>
            )}

            <Button className="w-full py-4 mt-2" type="submit" disabled={loading || emailSending}>
              {loading ? "Creating account..." : emailSending ? "Sending confirmation email..." : "Create Account"}
            </Button>
          </form>

          <div className="my-5 border-t border-gray-200" />

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
