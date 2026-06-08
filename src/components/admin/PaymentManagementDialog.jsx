import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '@/util/api';
import { toast } from 'sonner';

const PaymentManagementDialog = ({ request, onClose, onUpdate }) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch current payment status
  const fetchPaymentStatus = async () => {
    if (!request?.id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/payments/${request.id}/status`);
      setPaymentStatus(response.data);
    } catch (error) {
      toast.error('Failed to fetch payment status');
      console.error('Payment status fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark payment as completed
  const markPaymentCompleted = async () => {
    if (!reference.trim()) {
      toast.error('Payment reference is required');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/api/admin/payments/${request.id}/mark-completed`, {
        reference: reference.trim(),
        notes: notes.trim() || 'Manually verified by admin'
      });
      toast.success('Payment marked as completed successfully');
      await fetchPaymentStatus();
      onUpdate?.();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark payment completed';
      toast.error(errorMessage);
      console.error('Mark payment completed error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Approve with override
  const approveWithOverride = async () => {
    if (!confirm('Are you sure you want to approve this store registration with payment override? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await api.post(`/api/admin/registration-requests/${request.id}/approve-with-override?skipPaymentCheck=true`);
      toast.success('Store approved with payment override');
      onUpdate?.();
      onClose?.();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to approve with override';
      toast.error(errorMessage);
      console.error('Approve with override error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Regular approval
  const approveRegularly = async () => {
    try {
      setLoading(true);
      await api.post(`/api/admin/registration-requests/${request.id}/approve`);
      toast.success('Store approved successfully');
      onUpdate?.();
      onClose?.();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to approve registration';
      toast.error(errorMessage);
      console.error('Regular approval error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load payment status when dialog opens
  React.useEffect(() => {
    if (request) {
      fetchPaymentStatus();
      setReference(`MANUAL_${request.storeName?.replace(/\s+/g, '_')}_${Date.now()}`);
      setNotes(`Manual payment verification for ${request.storeName}`);
    }
  }, [request]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'COMPLETED': 'default',
      'APPROVED': 'default',
      'FAILED': 'destructive', 
      'PENDING': 'secondary',
      'PAYMENT_PENDING': 'outline',
      'REJECTED': 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (!request) return null;

  return (
    <Dialog open={true} onOpenChange={() => onClose?.()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Payment Management - {request.storeName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Store Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Store Registration Details
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchPaymentStatus}
                  disabled={loading}
                  className="ml-auto"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium text-gray-600">Store Name:</Label>
                  <p className="font-medium">{request.storeName}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Owner:</Label>
                  <p>{request.ownerName}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Email:</Label>
                  <p>{request.email}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Phone:</Label>
                  <p>{request.phone}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Subscription Plan:</Label>
                  <p className="font-medium">{request.subscriptionPlan}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Amount:</Label>
                  <p className="font-medium">NPR {request.subscriptionAmount || 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Registration Status:</Label>
                  <div>{getStatusBadge(request.status)}</div>
                </div>
                <div>
                  <Label className="font-medium text-gray-600">Payment Status:</Label>
                  <div>{getStatusBadge(request.paymentStatus)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Payment Status Details
                {paymentStatus && getStatusIcon(paymentStatus.paymentStatus)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading payment status...</p>
                </div>
              ) : paymentStatus ? (
                paymentStatus.error ? (
                  <div className="text-center py-4 text-red-600">
                    <XCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>{paymentStatus.error}</p>
                  </div>
                ) : paymentStatus.hasPaymentRecord ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <Label className="font-medium text-gray-600">Transaction ID:</Label>
                        <p className="font-mono text-xs bg-gray-100 p-1 rounded">{paymentStatus.transactionId}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Amount:</Label>
                        <p className="font-medium">NPR {paymentStatus.paymentAmount}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Payment Method:</Label>
                        <p>{paymentStatus.paymentMethod}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-600">Paid At:</Label>
                        <p>{paymentStatus.paidAt ? new Date(paymentStatus.paidAt).toLocaleString() : 'Not paid'}</p>
                      </div>
                      {paymentStatus.paymentGatewayReference && (
                        <div className="md:col-span-2">
                          <Label className="font-medium text-gray-600">Gateway Reference:</Label>
                          <p className="font-mono text-xs bg-gray-100 p-1 rounded">{paymentStatus.paymentGatewayReference}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="font-medium text-gray-600">Can Approve Normally:</Label>
                        <div className="mt-1">
                          <Badge variant={paymentStatus.canApprove ? 'default' : 'destructive'}>
                            {paymentStatus.canApprove ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                      
                      {paymentStatus.statusMessage && (
                        <div>
                          <Label className="font-medium text-gray-600">Status:</Label>
                          <p className="text-sm mt-1">{paymentStatus.statusMessage}</p>
                        </div>
                      )}
                      
                      {paymentStatus.recommendedAction && (
                        <div>
                          <Label className="font-medium text-gray-600">Recommended Action:</Label>
                          <p className="text-sm mt-1 text-blue-600">{paymentStatus.recommendedAction}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
                    <p className="text-lg font-medium">No payment record found</p>
                    <p className="text-sm">You can create a payment record or approve with override</p>
                  </div>
                )
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>Click refresh to load payment status</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Payment Completion */}
          {paymentStatus && !paymentStatus.canApprove && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manual Payment Verification</CardTitle>
                <p className="text-sm text-gray-600">
                  Use this section to manually mark the payment as completed if you have verified it through external means.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reference" className="text-sm font-medium">
                    Payment Reference <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Enter payment reference or transaction ID"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">Verification Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about how payment was verified..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  onClick={markPaymentCompleted} 
                  disabled={loading || !reference.trim()}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Mark Payment as Completed'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {paymentStatus?.canApprove && (
                <Button 
                  onClick={approveRegularly}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Processing...' : 'Approve Store'}
                </Button>
              )}
              
              <Button 
                onClick={approveWithOverride} 
                variant="destructive"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Approve (Override Payment)'}
              </Button>
              
              <Button 
                onClick={() => onClose?.()} 
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-2">Important Security Notice:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Only mark payment as complete if you have verified the payment externally (bank transfer, cash, etc.)</li>
                  <li>• Payment override should only be used in exceptional circumstances</li>
                  <li>• All admin actions are logged and auditable</li>
                  <li>• Store will receive login credentials via email after approval</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentManagementDialog;