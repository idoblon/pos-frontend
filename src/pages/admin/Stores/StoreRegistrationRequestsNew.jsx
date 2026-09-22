import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  CreditCard, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import api from '@/util/api';
import { toast } from 'sonner';
import PaymentManagementDialog from '@/components/admin/PaymentManagementDialog';

const StoreRegistrationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [paymentDialogRequest, setPaymentDialogRequest] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paymentPending: 0,
    approved: 0,
    rejected: 0
  });

  // Fetch all requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/registration-requests');
      setRequests(response.data);
      calculateStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch registration requests');
      console.error('Fetch requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(r => r.status === 'PENDING').length,
      paymentPending: data.filter(r => r.status === 'PAYMENT_PENDING').length,
      approved: data.filter(r => r.status === 'APPROVED').length,
      rejected: data.filter(r => r.status === 'REJECTED').length
    };
    setStats(stats);
  };

  // Approve request
  const approveRequest = async (id) => {
    try {
      await api.post(`/api/admin/registration-requests/${id}/approve`);
      toast.success('Store registration approved successfully');
      fetchRequests();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to approve registration';
      toast.error(errorMessage);
      
      // If it's a payment issue, offer to open payment management
      if (errorMessage.includes('Payment not completed')) {
        const request = requests.find(r => r.id === id);
        if (request && confirm('Payment not completed. Would you like to manage the payment?')) {
          setPaymentDialogRequest(request);
        }
      }
    }
  };

  // Reject request
  const rejectRequest = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await api.post(`/api/admin/registration-requests/${selectedRequest.id}/reject`, {
        reason: rejectReason.trim()
      });
      toast.success('Store registration rejected');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject registration');
      console.error('Reject request error:', error);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Load requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': { variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      'PAYMENT_PENDING': { variant: 'outline', color: 'bg-blue-100 text-blue-800' },
      'APPROVED': { variant: 'default', color: 'bg-green-100 text-green-800' },
      'REJECTED': { variant: 'destructive', color: 'bg-red-100 text-red-800' },
    };
    const config = variants[status] || { variant: 'outline', color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant={config.variant} className={config.color}>
        {status?.replace('_', ' ')}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const variants = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={variants[paymentStatus] || 'bg-gray-100 text-gray-800'}>
        {paymentStatus}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Registration Requests</h1>
          <p className="text-gray-600">Manage store registration and payment verification</p>
        </div>
        <Button onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.paymentPending}</p>
              <p className="text-sm text-gray-600">Payment Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by store name, owner name, or email..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-medium">Status Filter</Label>
              <div className="relative mt-1">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAYMENT_PENDING">Payment Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading registration requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'No requests match your current filters.' 
                  : 'No store registration requests available.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-xl font-semibold">{request.storeName}</h3>
                      {getStatusBadge(request.status)}
                      {getPaymentStatusBadge(request.paymentStatus)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="font-medium text-gray-600">Owner</Label>
                        <p>{request.ownerName}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Email</Label>
                        <p>{request.email}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Plan</Label>
                        <p>{request.subscriptionPlan}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Amount</Label>
                        <p>NPR {request.subscriptionAmount || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {request.createdAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Submitted: {new Date(request.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentDialogRequest(request)}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Payment
                    </Button>
                    
                    {(request.status === 'PENDING' || request.status === 'PAYMENT_PENDING') && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Request Dialog */}
      {selectedRequest && !rejectDialogOpen && (
        <Dialog open={true} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Store Registration Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Store Name</Label>
                  <p>{selectedRequest.storeName}</p>
                </div>
                <div>
                  <Label className="font-medium">Owner Name</Label>
                  <p>{selectedRequest.ownerName}</p>
                </div>
                <div>
                  <Label className="font-medium">Email</Label>
                  <p>{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="font-medium">Phone</Label>
                  <p>{selectedRequest.phone}</p>
                </div>
                <div>
                  <Label className="font-medium">Store Type</Label>
                  <p>{selectedRequest.storeType || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="font-medium">Subscription Plan</Label>
                  <p>{selectedRequest.subscriptionPlan}</p>
                </div>
              </div>
              
              {selectedRequest.storeAddress && (
                <div>
                  <Label className="font-medium">Store Address</Label>
                  <p>{selectedRequest.storeAddress}</p>
                </div>
              )}
              
              {selectedRequest.storeDescription && (
                <div>
                  <Label className="font-medium">Store Description</Label>
                  <p>{selectedRequest.storeDescription}</p>
                </div>
              )}
              
              {selectedRequest.rejectionReason && (
                <div>
                  <Label className="font-medium text-red-600">Rejection Reason</Label>
                  <p className="text-red-600">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Request Dialog */}
      {rejectDialogOpen && selectedRequest && (
        <Dialog open={true} onOpenChange={() => {
          setRejectDialogOpen(false);
          setSelectedRequest(null);
          setRejectReason('');
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Store Registration</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p>Are you sure you want to reject the registration for <strong>{selectedRequest.storeName}</strong>?</p>
              
              <div>
                <Label htmlFor="rejectReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectDialogOpen(false);
                    setSelectedRequest(null);
                    setRejectReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={rejectRequest}
                  disabled={!rejectReason.trim()}
                >
                  Reject Registration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Management Dialog */}
      {paymentDialogRequest && (
        <PaymentManagementDialog
          request={paymentDialogRequest}
          onClose={() => setPaymentDialogRequest(null)}
          onUpdate={fetchRequests}
        />
      )}
    </div>
  );
};

export default StoreRegistrationRequests;