import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, Clock, CheckCircle, Loader2, Smartphone } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuthData, clearAuthData } from '@/util/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/util/api';
import posLogo from '@/logo/pos.png';

const PLAN_PRICE = { BASIC: '3,500', PROFESSIONAL: '7,000', ENTERPRISE: '10,000' };

function EsewaForm({ onPay, loading, error }) {
  const [esewaId, setEsewaId] = useState('9806800001');
  const [mpin, setMpin] = useState('1122');
  return (
    <div className="space-y-3">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
        🧪 Test: ID <strong>9806800001</strong>, MPIN <strong>1122</strong>
      </div>
      <div className="space-y-1">
        <Label>eSewa ID</Label>
        <Input value={esewaId} onChange={e => setEsewaId(e.target.value)} placeholder="9806800001" />
      </div>
      <div className="space-y-1">
        <Label>MPIN</Label>
        <Input value={mpin} onChange={e => setMpin(e.target.value)} placeholder="1122" type="password" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full bg-[#60BB46] hover:bg-[#4ea336] text-white"
        onClick={() => onPay('ESEWA', `ESEWA-${esewaId}-${Date.now()}`)}
        disabled={loading || !esewaId.trim() || !mpin.trim()}>
        {loading ? <><Loader2 size={15} className="animate-spin mr-2" />Processing...</> : 'Pay with eSewa'}
      </Button>
    </div>
  );
}

function KhaltiForm({ onPay, loading, error }) {
  const [mobile, setMobile] = useState('9800000001');
  const [otp, setOtp] = useState('987654');
  return (
    <div className="space-y-3">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-800">
        🧪 Test: Mobile <strong>9800000001</strong>, OTP <strong>987654</strong>
      </div>
      <div className="space-y-1">
        <Label>Mobile Number</Label>
        <Input value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} placeholder="9800000001" maxLength={10} />
      </div>
      <div className="space-y-1">
        <Label>OTP / Token</Label>
        <Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="987654" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full bg-[#5C2D91] hover:bg-[#4a2275] text-white"
        onClick={() => onPay('KHALTI', otp)}
        disabled={loading || !mobile.trim() || !otp.trim()}>
        {loading ? <><Loader2 size={15} className="animate-spin mr-2" />Processing...</> : 'Pay with Khalti'}
      </Button>
    </div>
  );
}

export default function PaymentRequired() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState('ESEWA');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const authData = getAuthData();
    const resolvedEmail = urlEmail || authData.email || localStorage.getItem('pendingPaymentEmail');
    if (!resolvedEmail) { navigate('/login'); return; }
    setEmail(resolvedEmail);
    fetchStatus(resolvedEmail);
  }, []);

  const fetchStatus = async (em) => {
    try {
      const res = await api.get('/api/admin/store-payment/status', { params: { email: em } });
      if (res.data.status === 'PAID') {
        localStorage.removeItem('pendingPaymentEmail');
        navigate('/store-admin');
        return;
      }
      setStoreInfo(res.data);
    } catch {
      setError('Unable to load payment info. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (method, transactionId) => {
    setError('');
    setPaying(true);
    try {
      await api.post('/api/public/complete-payment', { email, paymentMethod: method, transactionId });
      setSuccess(true);
      localStorage.removeItem('pendingPaymentEmail');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-10 text-center">
          <Clock size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading payment info...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-10 text-center w-full max-w-md">
          <CheckCircle size={56} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground text-sm mb-1">
            Your store <strong>{storeInfo?.storeName}</strong> is now active.
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Check <strong>{email}</strong> for your login credentials.
          </p>
          <Button className="w-full" onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const plan = storeInfo?.plan || 'BASIC';
  const price = PLAN_PRICE[plan] || '3,500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo header — same as Login */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src={posLogo} alt="POS" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <span className="text-2xl font-bold text-slate-800">POS Pro</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Complete Payment</h1>
          <p className="text-slate-600 mt-1 text-sm">Activate your store subscription</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-5">
          {/* Store + plan info */}
          <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
            <CreditCard size={20} className="text-muted-foreground shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">{storeInfo?.storeName || 'Your Store'}</p>
              <p className="text-xs text-muted-foreground">{plan} Plan · ₹{price}/year</p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Your registration is approved. Complete payment to receive your login credentials.
            </p>
          </div>

          {/* Method tabs */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'ESEWA', label: 'eSewa', activeClass: 'border-green-500 bg-green-50 text-green-700' },
              { id: 'KHALTI', label: 'Khalti', activeClass: 'border-purple-500 bg-purple-50 text-purple-700' },
            ].map(m => (
              <button key={m.id} onClick={() => { setPayMethod(m.id); setError(''); }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-semibold transition-colors cursor-pointer
                  ${payMethod === m.id ? m.activeClass : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}>
                <Smartphone size={15} />{m.label}
              </button>
            ))}
          </div>

          {/* Payment form */}
          {payMethod === 'ESEWA' && <EsewaForm onPay={handlePay} loading={paying} error={error} />}
          {payMethod === 'KHALTI' && <KhaltiForm onPay={handlePay} loading={paying} error={error} />}

          <div className="border-t border-border" />

          <Button variant="ghost" className="w-full text-muted-foreground"
            onClick={() => { clearAuthData(); navigate('/login'); }}>
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
