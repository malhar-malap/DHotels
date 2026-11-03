import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { notificationsAPI } from '../../services/api';
import { notificationStyle, timeAgo, announceNotificationsChanged } from '../../utils/notifications';

const PAGE_SIZE = 20;

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll({ page, size: PAGE_SIZE });
      setItems(res.data?.data?.content || []);
      setTotalPages(res.data?.data?.totalPages || 0);
    } catch (e) {
      toast.error('Failed to load notifications');
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const openItem = async (n) => {
    if (!n.isRead) {
      setItems(prev => prev.map(i => (i.id === n.id ? { ...i, isRead: true } : i)));
      try { await notificationsAPI.markRead(n.id); } catch (e) { /* ignore */ }
      announceNotificationsChanged();
    }
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    try {
      await notificationsAPI.markAllRead();
      setItems(prev => prev.map(i => ({ ...i, isRead: true })));
      announceNotificationsChanged();
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error('Could not mark notifications as read');
    }
  };

  return (
    <DashboardLayout activeTab="Notifications">
      <div className="py-10 px-4 md:px-8 w-full">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="section-label mb-2 block">Updates</span>
              <h1 className="text-4xl display-title">Notifications</h1>
            </div>
            {items.some(i => !i.isRead) && (
              <button onClick={markAll} className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-gray-200 hover:bg-white/10 transition-colors">
                Mark all as read
              </button>
            )}
          </div>

          <div className="rounded-3xl bg-gray-900/80 border border-white/10 overflow-hidden">
            {loading ? (
              <p className="py-16 text-center text-sm text-gray-500">Loading…</p>
            ) : items.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-lg font-bold text-gray-200">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-1">Updates about your listings, inquiries and jobs will show up here.</p>
              </div>
            ) : items.map(n => {
              const { icon: Icon, color } = notificationStyle(n.type);
              return (
                <button key={n.id} onClick={() => openItem(n)}
                  className={`w-full text-left flex gap-4 px-5 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors ${n.isRead ? '' : 'bg-gray-800/70'}`}>
                  <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${color}`}><Icon size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className={`text-sm md:text-base leading-snug ${n.isRead ? 'text-gray-300' : 'text-white font-semibold'}`}>{n.title}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-gray-500 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-400" aria-label="Unread" />}
                      </span>
                    </span>
                    <span className="block text-sm text-gray-400 mt-1 break-words">{n.message}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 border border-gray-800 text-gray-300 disabled:opacity-40">Previous</button>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 border border-gray-800 text-gray-300 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
