import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/util/api";

const EditCustomerDialog = ({ open, onClose, customer, onSuccess }) => {
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });
    }
  }, [customer]);

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
      const response = await api.put(`/api/customers/${customer.id}`, formData);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>}
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={formData.address || ""} onChange={handleChange} placeholder="Address" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Customer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;
