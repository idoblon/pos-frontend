import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import api from "@/util/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!token) {
      toast.error("This password reset link is invalid.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/auth/reset-password", { token, newPassword });
      toast.success(response.data?.message || "Password reset successfully.");
      setComplete(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "This password reset link is invalid or has expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-800 text-center">Choose a new password</h1>
        {complete ? (
          <div className="mt-6 text-center space-y-4">
            <p className="text-slate-600">Your password has been reset. You can now sign in.</p>
            <Link to="/login" className="font-semibold text-foreground hover:underline">Back to login</Link>
          </div>
        ) : (
          <form className="space-y-5 mt-6" onSubmit={submit}>
            <div className="space-y-3">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required />
            </div>
            <div className="space-y-3">
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required />
            </div>
            <Button className="py-4 w-full" type="submit" disabled={submitting || !token}>
              {submitting ? "Resetting..." : "Reset Password"}
            </Button>
            <p className="text-sm text-center text-muted-foreground"><Link to="/login" className="hover:underline">Back to login</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
