import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiPhone,
  FiClock,
  FiCalendar,
  FiUser,
  FiMail,
  FiX,
  FiMessageSquare
} from 'react-icons/fi';

const AdminConsultationsPage = () => {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [durationFilter, setDurationFilter] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [keyword, setKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [stats, setStats] = useState(null);
    const [detailModal, setDetailModal] = useState({ open: false, consultation: null });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(keyword);
            setPage(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [keyword]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await adminAPI.getConsultationStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to load consultation stats', error);
        }
    }, []);

    const fetchConsultations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getConsultations({ 
                page, 
                size: 10, 
                status: statusFilter,
                duration: durationFilter || undefined,
                sortBy: sortBy,
                keyword: debouncedKeyword || undefined
            });
            const data = response.data.data;
            setConsultations(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            toast.error('Failed to load consultations');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, durationFilter, sortBy, debouncedKeyword]);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { fetchConsultations(); }, [fetchConsultations]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const dateWithTz = (dateStr.endsWith('Z') || dateStr.includes('+')) ? dateStr : `${dateStr}Z`;
        return new Date(dateWithTz).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            'PENDING_CALL': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'SCHEDULED': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'COMPLETED': 'bg-green-500/20 text-green-400 border-green-500/30',
            'CANCELLED': 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                {status?.replace('_', ' ')}
            </span>
        );
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            setUpdating(true);
            await adminAPI.updateConsultationStatus(id, newStatus, null);
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
            fetchConsultations();
            fetchStats();
            setDetailModal({ open: false, consultation: null });
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const statCards = [
        { label: 'Total Requests', value: stats?.totalConsultations || 0, color: 'bg-blue-500' },
        { label: 'Pending', value: stats?.pendingConsultations || 0, color: 'bg-yellow-500' },
        { label: 'Scheduled', value: stats?.scheduledConsultations || 0, color: 'bg-indigo-500' },
        { label: 'Completed', value: stats?.completedConsultations || 0, color: 'bg-green-500' },
    ];

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-primary-500/10 py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin" className="p-3 rounded-xl bg-gray-800/50 border border-white/10 hover:bg-gray-700/50 transition-colors">
                        <FiArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Call Requests</h1>
                        <p className="text-sm text-gray-400 mt-1">Manage scheduled call consultations</p>
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
                        {['ALL', 'PENDING_CALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setPage(0);
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    statusFilter === status
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-white/5'
                                }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Search requests..."
                                className="w-full bg-gray-900 border border-white/10 px-4 py-2 rounded-xl text-xs focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all placeholder-gray-500 text-gray-100"
                            />
                        </div>
                        <select
                            value={durationFilter}
                            onChange={(e) => {
                                setDurationFilter(e.target.value);
                                setPage(0);
                            }}
                            className="bg-gray-900 border border-white/10 px-4 py-2 rounded-xl text-xs text-gray-200 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all cursor-pointer w-full sm:w-auto"
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
                            className="bg-gray-900 border border-white/10 px-4 py-2 rounded-xl text-xs text-gray-200 focus:ring-2 focus:ring-primary-400/20 focus:outline-none transition-all cursor-pointer w-full sm:w-auto"
                        >
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-sm text-gray-500 mb-4">{totalElements} result{totalElements !== 1 ? 's' : ''}</p>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-400"></div>
                    </div>
                ) : consultations.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/20 rounded-2xl border border-white/5">
                        <FiPhone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">No call requests found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {consultations.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => setDetailModal({ open: true, consultation: c })}
                                className="bg-gray-800/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl hover:border-primary-400/30 transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 mt-1">
                                            <FiPhone size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                {getStatusBadge(c.status)}
                                                <span className="text-xs text-gray-500">{formatDate(c.createdAt)}</span>
                                            </div>
                                            <h3 className="text-white font-bold">{c.name}</h3>
                                            <p className="text-sm text-gray-400">{c.email} · {c.phone}</p>
                                            {c.preferredDate && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    <FiCalendar className="inline mr-1" />{c.preferredDate}
                                                    {c.timeSlot && ` · ${c.timeSlot.replace('_', ' ')}`}
                                                </p>
                                            )}
                                            {c.topic && (
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{c.topic}</p>
                                            )}
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-gray-500 group-hover:text-primary-400 transition-colors hidden md:block" />
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
            {detailModal.open && detailModal.consultation && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Call Request Details</h2>
                            <button onClick={() => setDetailModal({ open: false, consultation: null })} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                                <FiX className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-2">{getStatusBadge(detailModal.consultation.status)}</div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <FiUser className="text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                                        <p className="text-white font-medium">{detailModal.consultation.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiMail className="text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                                        <p className="text-white font-medium">{detailModal.consultation.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiPhone className="text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                                        <p className="text-white font-medium">{detailModal.consultation.phone}</p>
                                    </div>
                                </div>
                                {detailModal.consultation.preferredDate && (
                                    <div className="flex items-center gap-3">
                                        <FiCalendar className="text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Preferred Date</p>
                                            <p className="text-white font-medium">{detailModal.consultation.preferredDate}</p>
                                        </div>
                                    </div>
                                )}
                                {detailModal.consultation.timeSlot && (
                                    <div className="flex items-center gap-3">
                                        <FiClock className="text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Time Slot</p>
                                            <p className="text-white font-medium">{detailModal.consultation.timeSlot.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                )}
                                {detailModal.consultation.topic && (
                                    <div className="flex items-start gap-3">
                                        <FiMessageSquare className="text-gray-500 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Topic / Notes</p>
                                            <p className="text-gray-300 whitespace-pre-wrap">{detailModal.consultation.topic}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-gray-500">Submitted: {formatDate(detailModal.consultation.createdAt)}</p>

                            {/* Status Actions */}
                            <div className="border-t border-white/10 pt-5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {['PENDING_CALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED']
                                        .filter(s => s !== detailModal.consultation.status)
                                        .map(s => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusUpdate(detailModal.consultation.id, s)}
                                                disabled={updating}
                                                className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-800 border border-white/10 text-gray-300 hover:bg-gray-700 hover:text-white transition-all disabled:opacity-50"
                                            >
                                                Mark as {s.replace('_', ' ')}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminConsultationsPage;
