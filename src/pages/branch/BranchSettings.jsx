import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Settings, User, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserProfile, changePassword } from "@/Redux Toolkit/Features/user/userThunk";

export default function BranchSettings() {
  const dispatch = useDispatch();
  const { userProfile, loading } = useSelector((s) => s.user);

  const [profileForm, setProfileForm] = useState({
    firstName: userProfile?.firstName ?? "",
    lastName:  userProfile?.lastName  ?? "",
    email:     userProfile?.email     ?? "",
    phone:     userProfile?.phone     ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleProfileSave = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(profileForm));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    dispatch(changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }))
      .then((res) => {
        if (changePassword.fulfilled.match(res)) {
          setPasswordSuccess("Password changed successfully.");
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } else {
          setPasswordError(res.payload ?? "Failed to change password.");
        }
      });
  };

  const sectionCard = { background: "white", border: "1px solid #d1fae5", borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", gap: 20 };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, background: "#f0fdf4", minHeight: "100%", fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Settings</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Manage your account preferences</p>
      </div>

      {/* Profile */}
      <div style={sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #d1fae5", paddingBottom: 16 }}>
          <div style={{ padding: 8, background: "#d1fae5", borderRadius: 8 }}>
            <User size={18} color="#059669" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Profile Information</p>
            <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>Update your personal details</p>
          </div>
        </div>
        <form onSubmit={handleProfileSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[{ id: "firstName", label: "First Name" }, { id: "lastName", label: "Last Name" }].map(({ id, label }) => (
              <div key={id} className="space-y-1.5">
                <Label>{label}</Label>
                <Input value={profileForm[id]} onChange={(e) => setProfileForm((f) => ({ ...f, [id]: e.target.value }))} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={profileForm.email} onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#059669,#0d9488)", color: "white", border: "none" }}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div style={sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #d1fae5", paddingBottom: 16 }}>
          <div style={{ padding: 8, background: "#d1fae5", borderRadius: 8 }}>
            <Lock size={18} color="#059669" />
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
          {passwordError   && <p style={{ fontSize: 13, color: "#e53e3e", margin: 0 }}>{passwordError}</p>}
          {passwordSuccess && <p style={{ fontSize: 13, color: "#059669", margin: 0 }}>{passwordSuccess}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#059669,#0d9488)", color: "white", border: "none" }}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
