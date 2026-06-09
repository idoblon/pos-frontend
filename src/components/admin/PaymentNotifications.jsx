import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Store, Eye, Calendar } from 'lucide-react';
import api from '@/util/api';

export default function PaymentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/api/admin/registration-requests');
      const all = Array.isArray(res.data) ? res.data : [];
      const paid = all.filter(r => r.paymentStatus === 'COMPLETED');
      setNotifications(paid);
      setStats({
        total: paid.length,
        totalRevenue: paid.reduce((sum, r) => sum + (r.subscriptionAmount || 0), 0),
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => `रु ${(amount || 0).toLocaleString('en-IN')}`;

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—';

  return (
    <div style={{ padding: '24px', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#1a1d23' }}>
          Payment Notifications
        </h1>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
          Store subscription payments received
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#166534', lineHeight: 1 }}>रु</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Total Revenue</p>
            <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>{formatAmount(stats.totalRevenue)}</p>
          </div>
        </div>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={20} color='#1d4ed8' />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Payments Received</p>
            <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>{stats.total}</p>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '40px', textAlign: 'center' }}>
          <Bell size={48} color='#e5e7eb' style={{ margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>No payments received yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {notifications.map((n) => (
            <div key={n.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#166534', lineHeight: 1 }}>रु</span>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#1a1d23' }}>
                      Payment Received — {n.storeName}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{n.ownerName} • {n.subscriptionPlan} Plan</p>
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: '#f0fdf4', color: '#166534' }}>
                  {formatAmount(n.subscriptionAmount)}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', padding: '14px', background: '#f9fafb', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Payment Method</span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23' }}>{n.paymentMethod || '—'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Transaction ID</span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23', fontFamily: 'monospace' }}>{n.transactionId || '—'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Email</span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23' }}>{n.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Processed At</span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} />{formatDate(n.processedAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}