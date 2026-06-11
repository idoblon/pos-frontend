import React, { useState, useEffect } from 'react';
import { Bell, Calendar, CheckCircle, Eye, Store } from 'lucide-react';
import paymentNotificationService from '@/services/paymentNotificationService';

export default function PaymentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalRevenue: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const raw = await paymentNotificationService.getPaymentNotifications();
      const all = Array.isArray(raw) ? raw : [];
      const normalized = all
        .map((n) => ({
          id: n?.id ?? n?.paymentId ?? n?._id,
          storeName: n?.storeName ?? n?.store?.storeName ?? n?.store?.name,
          ownerName: n?.ownerName ?? n?.storeOwnerName ?? n?.owner?.name,
          email: n?.email,
          subscriptionPlan: n?.subscriptionPlan ?? n?.plan ?? n?.subscription?.plan,
          amount: n?.amount ?? n?.subscriptionAmount ?? n?.paymentDetails?.amount ?? 0,
          paymentMethod: n?.paymentMethod ?? n?.method ?? n?.paymentDetails?.method,
          transactionId: n?.transactionId ?? n?.paymentDetails?.transactionId,
          paidAt: n?.paidAt ?? n?.processedAt ?? n?.createdAt,
          isRead: Boolean(n?.isRead),
          status: n?.status,
        }))
        .filter((n) => n.id != null || n.transactionId != null)
        .sort((a, b) => new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime());

      setNotifications(normalized);
      setStats({
        total: normalized.length,
        unread: normalized.filter((n) => !n.isRead).length,
        totalRevenue: normalized.reduce((sum, r) => sum + (r.amount || 0), 0),
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

  const markAsRead = async (id) => {
    if (!id) return;
    await paymentNotificationService.markAsRead(id);
    loadNotifications();
  };

  const markAllAsRead = async () => {
    await paymentNotificationService.markAllAsRead();
    loadNotifications();
  };

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
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} color='#c2410c' />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Unread</p>
            <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>{stats.unread}</p>
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
          {stats.unread > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={markAllAsRead}
                style={{
                  background: '#111827',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle size={16} />
                Mark all as read
              </button>
            </div>
          )}
          {notifications.map((n) => (
            <div key={n.id ?? n.transactionId} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#166534', lineHeight: 1 }}>रु</span>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#1a1d23' }}>
                      Payment Received — {n.storeName || '—'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      {n.ownerName || '—'} • {n.subscriptionPlan ? `${n.subscriptionPlan} Plan` : 'Plan —'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      style={{
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#111827',
                      }}
                      title="Mark as read"
                    >
                      <Eye size={14} />
                      Read
                    </button>
                  )}
                  <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: '#f0fdf4', color: '#166534' }}>
                    {formatAmount(n.amount)}
                  </span>
                </div>
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
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23' }}>{n.email || '—'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Processed At</span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} />{formatDate(n.paidAt)}
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
