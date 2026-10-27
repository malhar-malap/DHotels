import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { 
  FiArrowLeft, 
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiTrash2,
  FiEye,
  FiMail,
  FiClock,
  FiMessageSquare,
  FiSend,
  FiX,
  FiUser,
  FiPhone,
  FiEdit3
} from 'react-icons/fi';

const AdminContactMessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [durationFilter, setDurationFilter] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [keyword, setKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, messageId: null });
    const [stats, setStats] = useState(null);
    const [detailModal, setDetailModal] = useState({ open: false, message: null });
    const [replyModal, setReplyModal] = useState({ open: false, message: null });
    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(keyword);
            setPage(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [keyword]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await adminAPI.getContactMessageStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to load stats', error);
        }
    }, []);

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getContactMessages({ 
                page, 
                size: 10, 
                status: statusFilter,
                duration: durationFilter || undefined,
                sortBy: sortBy,
                keyword: debouncedKeyword || undefined
            });
            const data = response.data.data;
            setMessages(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            toast.error('Failed to load messages');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, durationFilter, sortBy, debouncedKeyword]);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { fetchMessages(); }, [fetchMessages]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const dateWithTz = (dateStr.endsWith('Z') || dateStr.includes('+')) ? dateStr : `${dateStr}Z`;
        return new Date(dateWithTz).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            'NEW': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'READ': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'REPLIED': 'bg-green-500/20 text-green-400 border-green-500/30',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                {status}
            </span>
        );
    };

    const handleMarkAsRead = async (id) => {
        try {
            await adminAPI.markContactMessageRead(id);
            toast.success('Message marked as read');
            fetchMessages();
            fetchStats();
            setDetailModal({ open: false, message: null });
        } catch (error) {
            toast.error('Failed to mark message as read');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        setConfirmModal({ isOpen: true, messageId: id });
    };

    const confirmDelete = async () => {
        const id = confirmModal.messageId;
        setConfirmModal({ isOpen: false, messageId: null });
        if (!id) return;
        try {
            await adminAPI.deleteContactMessage(id);
            toast.success('Message deleted successfully');
            fetchMessages();
            fetchStats();
            setDetailModal({ open: false, message: null });
        } catch (error) {
            toast.error('Failed to delete message');
            console.error(error);
        }
    };

    const openReplyModal = (msg) => {
        setReplyModal({ open: true, message: msg });
        setReplyContent('');
    };

    const closeReplyModal = () => {
        setReplyModal({ open: false, message: null });
        setReplyContent('');
    };

    const handleReply = async () => {
        if (!replyContent.trim()) {
            toast.error('Please enter a reply message');
            return;
        }
        try {
            setReplying(true);
            await adminAPI.replyToContactMessage(replyModal.message.id, replyContent);
            toast.success('Reply sent successfully');
            closeReplyModal();
            fetchMessages();
            fetchStats();
        } catch (error) {
            toast.error('Failed to send reply');
            console.error(error);
        } finally {
            setReplying(false);
        }
    };

    const statCards = [
        { label: 'Total Messages', value: stats?.totalMessages || 0, color: 'bg-blue-500' },
        { label: 'New', value: stats?.newMessages || 0, color: 'bg-yellow-500' },
        { label: 'Read', value: stats?.readMessages || 0, color: 'bg-indigo-500' },
        { label: 'Replied', value: stats?.repliedMessages || 0, color: 'bg-green-500' },
    ];

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin" className="p-3 rounded-xl bg-gray-800/50 border border-white/10 hover:bg-gray-700/50 transition-colors">
                        <FiArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Contact Messages</h1>
                        <p className="text-sm text-gray-400 mt-1">Review and reply to user support enquiries</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat) => (
                        <div key={stat.label} className="bg-gray-800/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-2.5 h-2.5 ${stat.color} rounded-full`}></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <p className="text-3xl font-black text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2 flex-wrap">
                        {['ALL', 'NEW', 'READ', 'REPLIED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setPage(0);
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    statusFilter === status
                                        ? 'bg-[#db7c26] text-white'
                                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-white/5'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Search messages..."
                                className="w-full bg-gray-900 border border-white/10 px-4 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#db7c26]/20 focus:outline-none transition-all placeholder-gray-500 text-gray-100"
                            />
                        </div>
                        <select
                            value={durationFilter}
                            onChange={(e) => {
                                setDurationFilter(e.target.value);
                                setPage(0);
                            }}
                            className="bg-gray-900 border border-white/10 px-4 py-2 rounded-xl text-xs text-gray-200 focus:ring-2 focus:ring-[#db7c26]/20 focus:outline-none transition-all cursor-pointer w-full sm:w-auto"
                        >
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(0);
                            }}
                            className="bg-gray-900 border border-white/10 px-4 py-2 rounded-xl text-xs text-gray-200 focus:ring-2 focus:ring-[#db7c26]/20 focus:outline-none transition-all cursor-pointer w-full sm:w-auto"
                        >
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-sm text-gray-500 mb-4">{totalElements} message{totalElements !== 1 ? 's' : ''}</p>

                {/* Cards List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#db7c26]"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/20 rounded-2xl border border-white/5">
                        <FiMail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">No contact messages found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => setDetailModal({ open: true, message: msg })}
                                className="bg-gray-800/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl hover:border-[#db7c26]/30 transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-1">
                                            <FiMail size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                {getStatusBadge(msg.status)}
                                                <span className="text-xs text-gray-500">{formatDate(msg.createdAt)}</span>
                                            </div>
                                            <h3 className="text-white font-bold">{msg.name}</h3>
                                            <p className="text-sm text-gray-400">{msg.email} · {msg.phone}</p>
                                            <p className="text-sm text-gray-300 font-medium mt-1">{msg.subject}</p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{msg.message}</p>
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-gray-500 group-hover:text-[#db7c26] transition-colors hidden md:block" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 rounded-xl bg-gray-800/50 border border-white/10 disabled:opacity-30"
                        >
                            <FiChevronLeft className="text-white" />
                        </button>
                        <span className="text-sm text-gray-400">Page {page + 1} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="p-2 rounded-xl bg-gray-800/50 border border-white/10 disabled:opacity-30"
                        >
                            <FiChevronRight className="text-white" />
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {detailModal.open && detailModal.message && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Message Details</h2>
                            <button onClick={() => setDetailModal({ open: false, message: null })} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                                <FiX className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-2">{getStatusBadge(detailModal.message.status)}</div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <FiUser className="text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                                        <p className="text-white font-medium">{detailModal.message.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiMail className="text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                                        <p className="text-white font-medium">{detailModal.message.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiPhone className="text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                                        <p className="text-white font-medium">{detailModal.message.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FiMessageSquare className="text-gray-500 mt-1" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Subject</p>
                                        <p className="text-white font-medium">{detailModal.message.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FiEdit3 className="text-gray-500 mt-1" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Message</p>
                                        <p className="text-gray-300 whitespace-pre-wrap">{detailModal.message.message}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500">Submitted: {formatDate(detailModal.message.createdAt)}</p>

                            {/* Status & Management Actions */}
                            <div className="border-t border-white/10 pt-5 space-y-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Actions</p>
                                <div className="flex flex-wrap gap-2">
                                    {detailModal.message.status === 'NEW' && (
                                        <button
                                            onClick={() => handleMarkAsRead(detailModal.message.id)}
                                            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#db7c26]/20 border border-[#db7c26]/30 text-[#db7c26] hover:bg-[#db7c26] hover:text-white transition-all"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                    {detailModal.message.status !== 'REPLIED' && (
                                        <button
                                            onClick={() => {
                                                const msg = detailModal.message;
                                                setDetailModal({ open: false, message: null });
                                                openReplyModal(msg);
                                            }}
                                            className="px-4 py-2 rounded-lg text-xs font-bold bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white transition-all"
                                        >
                                            Reply via Email
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(detailModal.message.id)}
                                        className="px-4 py-2 rounded-lg text-xs font-bold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        Delete Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {replyModal.open && replyModal.message && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Send Reply</h2>
                                <p className="text-xs text-gray-400 mt-1">To: {replyModal.message.name} ({replyModal.message.email})</p>
                            </div>
                            <button onClick={closeReplyModal} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                                <FiX className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5 text-sm space-y-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Original Message</p>
                                <p className="text-white font-bold">{replyModal.message.subject}</p>
                                <p className="text-gray-400 leading-relaxed italic">"{replyModal.message.message}"</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Reply Content</label>
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    rows="6"
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#db7c26] resize-none text-sm"
                                    placeholder="Type your reply here..."
                                    autoFocus
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={closeReplyModal}
                                    className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReply}
                                    disabled={replying || !replyContent.trim()}
                                    className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#db7c26] text-white hover:bg-[#c26d21] transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {replying ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FiSend />
                                            Send Response
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, messageId: null })}
                onConfirm={confirmDelete}
                title="Delete Message"
                message="Are you sure you want to delete this contact message? This action cannot be undone."
                confirmText="Delete Message"
                isDanger={true}
            />
        </div>
    );
};

export default AdminContactMessagesPage;
