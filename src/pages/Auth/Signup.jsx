import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import posLogo from "@/logo/pos.png";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "@/Redux Toolkit/Features/auth/authThunk";
import { useNavigate, Link } from "react-router-dom";
import emailService from "@/util/emailService";

const STORE_TYPES = [
  { value: "RETAIL", label: "Retail" },
  { value: "WHOLESALE", label: "Wholesale" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "GROCERY", label: "Grocery" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "PLANT", label: "Plant" },
];

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    storeDescription: "",
    storeType: "",
    storePhone: "",
    storeEmail: "",
    storeAddress: "",
  });
  const [passwordError, setPasswordError] = useState("");

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

    if (!formData.storeName || formData.storeName.trim() === "") {
      setPasswordError("Store name is required");
      return;
    }

    const { confirmPassword, ...rest } = formData;
    const payload = { ...rest, role: "ROLE_STORE_ADMIN" };

    const result = await dispatch(signup(payload));
    if (signup.fulfilled.match(result)) {
      emailService.sendAccountCreatedEmail({
        email: formData.email,
        fullName: formData.fullName,
        storeName: formData.storeName,
        role: "ROLE_STORE_ADMIN",
      }).catch((err) => console.warn("⚠️ Email failed:", err));
      navigate("/login");
    }
  };

  const fieldCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <img
                src={posLogo}
                alt="POS"
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            </div>
            <span className="text-2xl font-bold text-slate-800">POS Pro</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Create Your Store Account
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            Register your business to get started
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Two-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
              {/* LEFT — User Information */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 mb-4 border-b border-gray-100">
                  User Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Full Name
                    </Label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className={fieldCls}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={fieldCls}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Phone
                    </Label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={fieldCls}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Password
                    </Label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className={fieldCls}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Confirm Password
                    </Label>
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={fieldCls}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT — Store Information */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 mb-4 border-b border-gray-100">
                  Store Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Store Name
                    </Label>
                    <Input
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      required
                      className={fieldCls}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Store Type
                    </Label>
                    <select
                      name="storeType"
                      value={formData.storeType}
                      onChange={handleChange}
                      className={fieldCls}
                    >
                      <option value="">Select store type</option>
                      {STORE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Store Email
                    </Label>
                    <Input
                      name="storeEmail"
                      type="email"
                      value={formData.storeEmail}
                      onChange={handleChange}
                      className={fieldCls}
                    />
                  </div> */}
                  {/* <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Store Phone
                    </Label>
                    <Input
                      name="storePhone"
                      type="tel"
                      value={formData.storePhone}
                      onChange={handleChange}
                      className={fieldCls}
                    />
                  </div> */}
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Store Address
                    </Label>
                    <textarea
                      name="storeAddress"
                      value={formData.storeAddress}
                      onChange={handleChange}
                      rows={2}
                      className={`${fieldCls} resize-none`}
                    />
                  </div>
                   <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Store Description
                    </Label>
                    <textarea
                      name="storeDescription"
                      value={formData.storeDescription}
                      onChange={handleChange}
                      rows={3}
                      className={`${fieldCls} resize-none`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {(passwordError || error) && (
              <p className="mt-5 text-sm text-red-500 text-center">
                {passwordError || error}
              </p>
            )}

            {/* Submit */}
            <div className="mt-6">
              <Button
                className="w-full py-2.5 text-sm font-semibold"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-800 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
