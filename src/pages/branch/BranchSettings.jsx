import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserProfile, changePassword, getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { toast } from "sonner";
import PaymentSettings from "./PaymentSettings";

export default function BranchSettings() {
  const dispatch = useDispatch();
  const { userProfile, loading } = useSelector((s) => s.user);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Load user profile on component mount
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  // Update form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
      });
    }
  }, [userProfile]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateUserProfile(profileForm)).unwrap();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await dispatch(changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })).unwrap();
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error || "Failed to change password");
    }
  };

  const sectionCard = { background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", gap: 20 };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, background: "#f5f5f5", minHeight: "100%", fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Settings</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Manage your account preferences</p>
      </div>

      {/* Profile */}
      <div style={sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
          <div style={{ padding: 8, background: "#e5e7eb", borderRadius: 8 }}>
            <User size={18} color="#1a1d23" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Profile Information</p>
            <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>Update your personal details</p>
          </div>
        </div>
        <form onSubmit={handleProfileSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 400 }}>
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input 
                value={profileForm.fullName} 
                onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))} 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input 
                type="email" 
                value={profileForm.email} 
                onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))} 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input 
                value={profileForm.phone} 
                onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} 
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div style={sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
          <div style={{ padding: 8, background: "#e5e7eb", borderRadius: 8 }}>
            <Lock size={18} color="#1a1d23" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Change Password</p>
            <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>Update your account password</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
          {[
            { id: "currentPassword", label: "Current Password" },
            { id: "newPassword",     label: "New Password" },
            { id: "confirmPassword", label: "Confirm New Password" },
          ].map(({ id, label }) => (
            <div key={id} className="space-y-1.5">
              <Label>{label}</Label>
              <Input type="password" value={passwordForm[id]} onChange={(e) => setPasswordForm((f) => ({ ...f, [id]: e.target.value }))} required />
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>

      {/* Payment Settings */}
      <div style={sectionCard}>
        <PaymentSettings />
      </div>
    </div>
  );
}