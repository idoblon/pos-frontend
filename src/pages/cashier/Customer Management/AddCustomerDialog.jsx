import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/util/api";

const AddCustomerDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.fullName || !formData.phone) {
      setError("Full name and phone are required");
      return;
    }
    try {
      setLoading(true);
      const response = await api.post("/api/customers", formData);
      onSuccess(response.data);
      setFormData({ fullName: "", email: "", phone: "", address: "" });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>}
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full name" required />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email address" />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Customer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDialog;
