import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PiBell } from 'react-icons/pi';
import { notificationsAPI } from '../../services/api';
import { notificationStyle, timeAgo, NOTIFICATIONS_CHANGED, announceNotificationsChanged } from '../../utils/notifications';

const POLL_MS = 60000;

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const refreshCount = useCallback(async () => {
    try {
      const res = await notificationsAPI.getUnreadCount();
      setUnread(res.data?.data?.count || 0);
    } catch (e) {
      // Not signed in or offline: keep the last known count
    }
  }, []);

  // Poll while the tab is visible; refresh as soon as the user comes back to it
  useEffect(() => {
    refreshCount();
    const timer = setInterval(() => { if (!document.hidden) refreshCount(); }, POLL_MS);
    const onVisible = () => { if (!document.hidden) refreshCount(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener(NOTIFICATIONS_CHANGED, refreshCount);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refreshCount);
    };
  }, [refreshCount]);

  useEffect(() => {
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        const res = await notificationsAPI.getAll({ page: 0, size: 8 });
        setItems(res.data?.data?.content || []);
      } catch (e) {
        setItems([]);
      }
      setLoading(false);
    }
  };

  const openItem = async (n) => {
    setOpen(false);
    if (!n.isRead) {
      setItems(prev => prev.map(i => (i.id === n.id ? { ...i, isRead: true } : i)));
      try { await notificationsAPI.markRead(n.id); } catch (e) { /* badge refresh below corrects it */ }
      announceNotificationsChanged();
    }
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    try {
      await notificationsAPI.markAllRead();
      setItems(prev => prev.map(i => ({ ...i, isRead: true })));
      announceNotificationsChanged();
    } catch (e) { /* ignore */ }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'} aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 transition-colors hover:border-primary-400/40 hover:text-gray-50">
        <PiBell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-gray-950">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        // Phones: full-width panel under the header; larger screens: dropdown anchored to the bell
        <div className="fixed inset-x-4 top-[72px] sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3 sm:w-[22rem] surface-raised z-50 animate-fadeIn overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-sm font-bold text-white">Notifications</p>
            {items.some(i => !i.isRead) && (
              <button onClick={markAll} className="text-[11px] font-bold text-primary-400 hover:text-primary-300">Mark all read</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-xs text-gray-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-gray-500">You're all caught up.</p>
            ) : items.map(n => {
              const { icon: Icon, color } = notificationStyle(n.type);
              return (
                <button key={n.id} onClick={() => openItem(n)}
                  className={`w-full text-left flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${n.isRead ? '' : 'bg-gray-800/70'}`}>
                  <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${color}`}><Icon size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className={`text-sm leading-snug ${n.isRead ? 'text-gray-300' : 'text-white font-semibold'}`}>{n.title}</span>
                      {!n.isRead && <span className="mt-1.5 w-2 h-2 shrink-0 rounded-full bg-primary-400" />}
                    </span>
                    <span className="block text-xs text-gray-400 line-clamp-2 mt-0.5">{n.message}</span>
                    <span className="block text-[11px] text-gray-500 mt-1">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <Link to="/dashboard/notifications" onClick={() => setOpen(false)}
            className="block text-center text-xs font-bold text-gray-300 hover:text-white py-3 border-t border-white/10">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
