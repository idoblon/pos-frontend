import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Calendar, CheckCircle, Eye, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/util/api';
import paymentNotificationService from '@/services/paymentNotificationService';
import {
  getAdminSystemSettings,
  secondsToMilliseconds,
  subscribeAdminSystemSettings,
} from '@/util/adminSystemSettings';

// Server-backed ledger: GET /api/admin/payments?status&page&size.
// Falls back to the local demo cache (live pending / offline showcase).
export default function PaymentNotifications() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalRevenue: 0, unread: 0, totalElements: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('server');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminReadPayments') || '[]'); } catch { return []; }
  });
  const [adminSettings, setAdminSettings] = useState(getAdminSystemSettings);

  useEffect(() => subscribeAdminSystemSettings(setAdminSettings), []);

  const persistReadIds = (ids) => {
    setReadIds(ids);
    try { localStorage.setItem('adminReadPayments', JSON.stringify(ids)); } catch { /* best-effort */ }
  };

  const loadLedger = useCallback(async (pageArg = page, statusArg = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: pageArg, size: 20 };
      if (statusArg) params.status = statusArg;
      const res = await api.get('/api/admin/payments', { params });
      const content = Array.isArray(res.data?.content) ? res.data.content : [];
      setRows(content.map((r) => ({
        id: r.id, registrationId: r.registrationId,
        storeName: r.storeName, ownerName: r.ownerName, email: r.email,
        subscriptionPlan: r.subscriptionPlan, amount: Number(r.amount) || 0,
        paymentMethod: r.paymentMethod, paymentStatus: r.paymentStatus,
        transactionId: r.transactionId, paidAt: r.paidAt || r.createdAt, createdAt: r.createdAt,
        isRead: readIds.includes(String(r.id ?? r.transactionId)),
      })));
      const totalRevenue = Number(res.data?.totalRevenue) || 0;
      setStats({
        total: res.data?.totalElements ?? content.length,
        totalElements: res.data?.totalElements ?? content.length,
        totalPages: res.data?.totalPages ?? 1,
        totalRevenue,
        unread: content.filter((r) => !readIds.includes(String(r.id ?? r.transactionId))).length,
      });
      setSource('server');
    } catch {
      // Demo fallback: local cache so the showcase works without the backend.
      try {
        const raw = await paymentNotificationService.getPaymentNotifications();
        const all = (Array.isArray(raw) ? raw : []).map((n) => ({
          id: n?.id ?? n?.paymentId ?? n?._id,
          registrationId: n?.registrationId,
          storeName: n?.storeName, ownerName: n?.ownerName, email: n?.email,
          subscriptionPlan: n?.subscriptionPlan ?? n?.plan,
          amount: Number(n?.amount ?? n?.paymentAmount ?? 0) || 0,
          paymentMethod: n?.paymentMethod, paymentStatus: n?.status || 'COMPLETED',
          transactionId: n?.transactionId, paidAt: n?.paidAt || n?.createdAt, createdAt: n?.createdAt,
          isRead: readIds.includes(String(n?.id ?? n?.transactionId)),
        }));
        const filtered = statusFilter ? all.filter((r) => r.paymentStatus === statusFilter) : all;
        setRows(filtered);
        setStats({
          total: filtered.length, totalElements: filtered.length, totalPages: 1,
          totalRevenue: filtered.reduce((s, r) => s + (r.amount || 0), 0),
          unread: filtered.filter((r) => !r.isRead).length,
        });
        setSource('demo');
      } catch { /* silent */ }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, readIds]);

  useEffect(() => {
    loadLedger();
    const interval = setInterval(
      () => loadLedger(),
      secondsToMilliseconds(adminSettings.paymentPollingSeconds, 10, 5),
    );
    return () => clearInterval(interval);
  }, [adminSettings.paymentPollingSeconds, loadLedger]);

  const formatAmount = (amount) => `रु ${(amount || 0).toLocaleString('en-IN')}`;
  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—';

  const markAsRead = (id) => {
    if (!id) return;
    persistReadIds([...new Set([...readIds, String(id)])]);
  };

  const markAllAsRead = () => {
    persistReadIds(rows.map((r) => String(r.id ?? r.transactionId)));
  };

  const confirmPayment = (row) => {
    if (!row.registrationId) { toast.error('No registration linked to this row'); return; }
    setDialog({
      title: `Confirm payment — ${row.storeName || 'store'}`,
      label: 'Admin reference (required)',
      placeholder: `ADMIN_MANUAL_${Date.now()}`,
      confirmText: 'Confirm',
      onConfirm: async (reference) => {
        setDialog(null);
        try {
          await api.post(`/api/admin/payments/${row.registrationId}/confirm`, { reference });
          toast.success('Payment confirmed');
          loadLedger();
        } catch (e) {
          toast.error('Confirm failed: ' + (e.response?.data?.message || e.message));
        }
      },
    });
  };

  const voidPayment = (row) => {
    if (!row.registrationId) { toast.error('No registration linked to this row'); return; }
    setDialog({
      title: `Void payment — ${row.storeName || 'store'}`,
      label: 'Reason (required)',
      placeholder: 'e.g. duplicate entry',
      confirmText: 'Void',
      onConfirm: async (reason) => {
        setDialog(null);
        try {
          await api.post(`/api/admin/payments/${row.registrationId}/void`, { reason });
          toast.success('Payment voided');
          loadLedger();
        } catch (e) {
          toast.error('Void failed: ' + (e.response?.data?.message || e.message));
        }
      },
    });
  };

  const changePage = (next) => {
    const clamped = Math.max(0, Math.min(next, Math.max(stats.totalPages - 1, 0)));
    setPage(clamped);
    loadLedger(clamped, statusFilter);
  };

  const changeStatus = (status) => {
    setStatusFilter(status);
    setPage(0);
    loadLedger(0, status);
  };

  return (
    <div style={{ padding: '24px', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#1a1d23' }}>
            Payment Ledger
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            Store subscription payments received
            {source === 'demo' && ' — demo cache (backend unreachable)'}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => changeStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }}
        >
          <option value="">All statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed/void</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(26, 29, 35, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#1a1d23', lineHeight: 1 }}>रु</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Total Revenue</p>
            <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>{formatAmount(stats.totalRevenue)}</p>
          </div>
        </div>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(26, 29, 35, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={20} color='#1a1d23' />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Payments Received</p>
            <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>{stats.total}</p>
          </div>
        </div>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(26, 29, 35, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} color='#1a1d23' />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Unread</p>
            <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>{stats.unread}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div>
      ) : rows.length === 0 ? (
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
                style={{ background: '#1a1d23', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle size={16} />
                Mark all as read
              </button>
            </div>
          )}
          {rows.map((n) => (
            <div key={n.id ?? n.transactionId} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(26, 29, 35, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#1a1d23', lineHeight: 1 }}>रु</span>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#1a1d23' }}>
                      Payment Received — {n.storeName || '—'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      {n.ownerName || '—'} • {n.subscriptionPlan ? `${n.subscriptionPlan} Plan` : 'Plan —'} • {n.paymentStatus || '—'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id ?? n.transactionId)}
                      style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#1a1d23' }}
                      title="Mark as read"
                    >
                      <Eye size={14} />
                      Read
                    </button>
                  )}
                  {n.paymentStatus === 'PENDING' && source === 'server' && (
                    <button onClick={() => confirmPayment(n)} style={{ border: 'none', background: '#1a1d23', color: 'white', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                      Confirm
                    </button>
                  )}
                  {n.paymentStatus !== 'FAILED' && source === 'server' && (
                    <button onClick={() => voidPayment(n)} style={{ border: '1px solid #fecaca', background: 'white', color: '#991b1b', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                      Void
                    </button>
                  )}
                  <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: 'rgba(26, 29, 35, 0.1)', color: '#1a1d23' }}>
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
          {stats.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 12 }}>
              <button onClick={() => changePage(page - 1)} disabled={page === 0} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Page {page + 1} of {stats.totalPages}</span>
              <button onClick={() => changePage(page + 1)} disabled={page + 1 >= stats.totalPages} style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 6, padding: '6px 10px', cursor: page + 1 >= stats.totalPages ? 'not-allowed' : 'pointer' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {dialog && (
        <div onClick={() => setDialog(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: 10, padding: 20, width: '100%', maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>{dialog.title}</h3>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563' }}>{dialog.label}</label>
            <DialogInput dialog={dialog} onClose={() => setDialog(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function DialogInput({ dialog, onClose }) {
  const [value, setValue] = useState('');
  return (
    <>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={dialog.placeholder}
        style={{ marginTop: 6, width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
          Cancel
        </button>
        <button
          onClick={() => value.trim() && dialog.onConfirm(value.trim())}
          disabled={!value.trim()}
          style={{ padding: '8px 14px', border: 'none', borderRadius: 6, background: value.trim() ? '#1a1d23' : '#e5e7eb', color: value.trim() ? 'white' : '#9ca3af', cursor: value.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700 }}
        >
          {dialog.confirmText}
        </button>
      </div>
    </>
  );
}
