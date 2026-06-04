import { Label } from "@radix-ui/react-label";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SubscriptionCalculator from "@/components/ui/SubscriptionCalculator";
import posLogo from "@/logo/pos.png";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Check } from "lucide-react";

const STORE_TYPES = [
  { value: "RETAIL", label: "Retail" },
  { value: "WHOLESALE", label: "Wholesale" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "GROCERY", label: "Grocery" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "PLANT", label: "Plant" },
];

const SUBSCRIPTION_PLANS = [
  { 
    value: "BASIC", 
    label: "Basic", 
    price: "रु 2,999/month",
    features: ["1 Store", "3 Branches", "10 Users", "Basic Support"]
  },
  { 
    value: "PROFESSIONAL", 
    label: "Professional", 
    price: "रु 5,999/month",
    features: ["1 Store", "10 Branches", "50 Users", "Priority Support", "Advanced Reports"]
  },
  { 
    value: "ENTERPRISE", 
    label: "Enterprise", 
    price: "रु 12,999/month",
    features: ["Unlimited Stores", "Unlimited Branches", "Unlimited Users", "24/7 Support", "Custom Features"]
  },
];

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [useCalculator, setUseCalculator] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    storeDescription: "",
    storeType: "",
    storeAddress: "",
    subscriptionPlan: "BASIC",
    estimatedBranches: 1,
    estimatedUsers: 5
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

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/public/store-registration-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          storeName: formData.storeName,
          storeDescription: formData.storeDescription,
          storeType: formData.storeType,
          storeAddress: formData.storeAddress,
          subscriptionPlan: formData.subscriptionPlan,
          estimatedBranches: formData.estimatedBranches,
          estimatedUsers: formData.estimatedUsers
        })
      });

      if (response.ok) {
        toast.success("Registration request submitted! Admin will review and notify you via email.");
        navigate("/login");
      } else {
        const error = await response.text();
        setPasswordError(error || "Failed to submit registration request");
      }
    } catch (error) {
      setPasswordError("Error submitting request. Please try again.");
    } finally {
      setLoading(false);
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
            Request Store Registration
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            Submit your registration request for admin approval
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
                      rows={2}
                      className={`${fieldCls} resize-none`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Choose Subscription Plan
                </h3>
                <button
                  type="button"
                  onClick={() => setUseCalculator(!useCalculator)}
                  style={{
                    padding: "6px 12px",
                    background: useCalculator ? "#1a1d23" : "white",
                    color: useCalculator ? "white" : "#1a1d23", 
                    border: "1px solid #1a1d23",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {useCalculator ? "Simple View" : "Smart Calculator"}
                </button>
              </div>

              {useCalculator ? (
                <SubscriptionCalculator
                  onPlanSelect={(plan) => setFormData({ ...formData, subscriptionPlan: plan })}
                  selectedPlan={formData.subscriptionPlan}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <div
                      key={plan.value}
                      onClick={() => setFormData({ ...formData, subscriptionPlan: plan.value })}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.subscriptionPlan === plan.value
                          ? "border-slate-800 bg-slate-50"
                          : "border-gray-200 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-800">{plan.label}</h4>
                          <p className="text-sm font-bold text-slate-600 mt-1">{plan.price}</p>
                        </div>
                        {formData.subscriptionPlan === plan.value && (
                          <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
                            <Check size={14} color="white" />
                          </div>
                        )}
                      </div>
                      <ul className="space-y-1 mt-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div style={{
                        marginTop: "8px",
                        padding: "6px",
                        background: "#fef3c7",
                        borderRadius: "4px",
                        fontSize: "10px",
                        color: "#92400e"
                      }}>
                        Need more branches? Add रु 500/branch extra
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Usage Estimation */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Expected Branches
                  </Label>
                  <Input
                    name="estimatedBranches"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.estimatedBranches}
                    onChange={handleChange}
                    className={fieldCls}
                    placeholder="How many locations?"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Expected Users
                  </Label>
                  <Input
                    name="estimatedUsers"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.estimatedUsers}
                    onChange={handleChange}
                    className={fieldCls}
                    placeholder="Total staff members?"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {passwordError && (
              <p className="mt-5 text-sm text-red-500 text-center">
                {passwordError}
              </p>
            )}

            {/* Submit */}
            <div className="mt-6">
              <Button
                className="w-full py-2.5 text-sm font-semibold"
                type="submit"
                disabled={loading}
              >
                {loading ? "Submitting request…" : "Submit Registration Request"}
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
