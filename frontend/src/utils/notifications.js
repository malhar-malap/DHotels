import {
  FiCheckCircle, FiXCircle, FiTrash2, FiClock, FiMail, FiUnlock, FiBriefcase,
  FiFileText, FiShield, FiAlertCircle, FiBell, FiSmile, FiStar,
} from 'react-icons/fi';

// Icon + accent colour per backend notification type (see NotificationService constants)
const TYPE_STYLES = {
  LISTING_APPROVED: { icon: FiCheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
  JOB_APPROVED: { icon: FiCheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
  VERIFICATION_APPROVED: { icon: FiShield, color: 'text-emerald-400 bg-emerald-500/10' },
  LISTING_REJECTED: { icon: FiXCircle, color: 'text-rose-400 bg-rose-500/10' },
  JOB_REJECTED: { icon: FiXCircle, color: 'text-rose-400 bg-rose-500/10' },
  VERIFICATION_REJECTED: { icon: FiXCircle, color: 'text-rose-400 bg-rose-500/10' },
  LISTING_DELETED: { icon: FiTrash2, color: 'text-rose-400 bg-rose-500/10' },
  JOB_DELETED: { icon: FiTrash2, color: 'text-rose-400 bg-rose-500/10' },
  LISTING_PENDING: { icon: FiClock, color: 'text-amber-300 bg-amber-500/10' },
  LISTING_FEATURED: { icon: FiStar, color: 'text-amber-300 bg-amber-500/10' },
  JOB_PENDING: { icon: FiClock, color: 'text-amber-300 bg-amber-500/10' },
  VERIFICATION_PENDING: { icon: FiClock, color: 'text-amber-300 bg-amber-500/10' },
  INQUIRY_RECEIVED: { icon: FiMail, color: 'text-sky-300 bg-sky-500/10' },
  CONTACT_UNLOCKED: { icon: FiUnlock, color: 'text-primary-400 bg-primary-400/10' },
  APPLICATION_RECEIVED: { icon: FiBriefcase, color: 'text-sky-300 bg-sky-500/10' },
  APPLICATION_UPDATED: { icon: FiFileText, color: 'text-sky-300 bg-sky-500/10' },
  ADMIN_ALERT: { icon: FiAlertCircle, color: 'text-primary-400 bg-primary-400/10' },
  WELCOME: { icon: FiSmile, color: 'text-primary-400 bg-primary-400/10' },
};

export const notificationStyle = (type) => TYPE_STYLES[type] || { icon: FiBell, color: 'text-gray-300 bg-white/5' };

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Fired after notifications are read so the header bell refreshes its badge immediately
export const NOTIFICATIONS_CHANGED = 'notifications:changed';
export const announceNotificationsChanged = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
