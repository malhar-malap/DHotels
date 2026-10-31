import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { generateSlug } from '../../utils/slugify';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiList,
  FiSearch,
  FiFilter
} from 'react-icons/fi';

const AdminPaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [statusFilter, setStatusFilter] = useState('PAID');
    const [stats, setStats] = useState(null);
    const [syncing, setSyncing] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handlePresetChange = (preset) => {
        const today = new Date();
        const formatDateString = (date) => {
            return date.toISOString().split('T')[0];
        };

        if (preset === '24h') {
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            setFromDate(formatDateString(yesterday));
            setToDate(formatDateString(today));
        } else if (preset === 'week') {
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            setFromDate(formatDateString(lastWeek));
            setToDate(formatDateString(today));
        } else if (preset === 'month') {
            const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            setFromDate(formatDateString(lastMonth));
            setToDate(formatDateString(today));
        } else if (preset === 'clear') {
            setFromDate('');
            setToDate('');
        }
    };

    const clearQueryFilters = () => {
        setKeyword('');
        setFromDate('');
        setToDate('');
    };

    const handleSync = async (id) => {
        try {
            setSyncing(id);
            await adminAPI.syncPayment(id);
            toast.success("Payment synced successfully");
            fetchPayments();
            fetchStats();
        } catch (error) {
            toast.error("Failed to sync payment");
        } finally {
            setSyncing(null);
        }
    };

    const fetchStats = useCallback(async () => {
        try {
            const response = await adminAPI.getPaymentStats({ excludeStatus: 'CREATED' });
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to load payment stats', error);
        }
    }, []);

    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            const params = { 
                page, 
                size: 10, 
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
                keyword: keyword || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined
            };
            const response = await adminAPI.getPayments(params);
            const data = response.data.data;
            setPayments(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            toast.error('Failed to load payments');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, keyword, fromDate, toDate]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        setPage(0);
    }, [statusFilter, keyword, fromDate, toDate]);

    useEffect(() => {
        fetchPayments();
    }, [page, fetchPayments]);

    const formatCurrency = (paise) => {
        return `₹${((paise || 0) / 100).toLocaleString('en-IN')}`;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PAID':
                return 'bg-primary-400/10 text-primary-300 border-primary-300/50';
            case 'FAILED':
                return 'bg-rose-50 text-rose-700 border-rose-200/50';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200/50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PAID':
                return <FiCheckCircle className="w-3 h-3" />;
            case 'FAILED':
                return <FiXCircle className="w-3 h-3" />;
            default:
                return <FiClock className="w-3 h-3" />;
        }
    };

    return (
        <div className="min-h-screen bg-transparent py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <Link to="/admin" className="p-2 rounded-xl bg-gray-900/50 text-ethereal-on-surface-variant hover:text-ethereal-primary transition-all duration-300">
                                <FiArrowLeft className="w-5 h-5" />
                            </Link>
                            <span className="section-label tracking-[0.2em]">Financial Core</span>
                        </div>
                        <h1 className="text-4xl display-title uppercase tracking-tighter">Payments Ledger</h1>
                        <p className="text-ethereal-on-surface-variant font-medium mt-1">
                            Auditing <span className="text-ethereal-primary font-bold">{totalElements}</span> transactions across network
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="glass-card p-6 rounded-[1.5rem] border-none">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-primary-300/20/50 text-primary-400">
                                    <FiCreditCard size={18} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Total Volume</span>
                            </div>
                            <h3 className="text-2xl font-black text-ethereal-on-surface">{formatCurrency(stats.totalRevenuePaise)}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-primary-400 mt-1">{stats.successfulPayments} Successful Transactions</p>
                        </div>
                        <div className="glass-card p-6 rounded-[1.5rem] border-none">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-blue-100/50 text-blue-600">
                                    <FiCheckCircle size={18} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">24h Revenue</span>
                            </div>
                            <h3 className="text-2xl font-black text-ethereal-on-surface">{formatCurrency(stats.todayRevenuePaise)}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-blue-600 mt-1">{stats.todayPayments} Transactions Today</p>
                        </div>
                        <div className="glass-card p-6 rounded-[1.5rem] border-none">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-purple-100/50 text-purple-600">
                                    <FiCalendar size={18} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Weekly Revenue</span>
                            </div>
                            <h3 className="text-2xl font-black text-ethereal-on-surface">{formatCurrency(stats.weekRevenuePaise)}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-purple-600 mt-1">{stats.weekPayments} Transactions This Week</p>
                        </div>
                        <div className="glass-card p-6 rounded-[1.5rem] border-none overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-bl from-rose-500 rounded-bl-full w-24 h-24"></div>
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="p-2.5 rounded-xl bg-rose-100/50 text-rose-600">
                                    <FiXCircle size={18} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Failed</span>
                            </div>
                            <h3 className="text-2xl font-black text-ethereal-on-surface relative z-10">{stats.failedPayments}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-rose-600 mt-1 relative z-10">Bounced Transactions</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['ALL', 'CREATED', 'PAID', 'FAILED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-6 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                statusFilter === status 
                                ? 'bg-ethereal-primary text-white shadow-lg shadow-ethereal-primary/20' 
                                : 'bg-gray-900 text-ethereal-on-surface-variant hover:bg-ethereal-surface-low shadow-sm'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Precision Filters Card */}
                <div className="glass-card p-6 rounded-[2rem] border-none mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-ethereal-primary/10 text-ethereal-primary"><FiFilter className="w-4 h-4" /></div>
                        <span className="text-sm font-black uppercase tracking-widest text-ethereal-on-surface">Precision Filters</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Bar */}
                        <div className="relative md:col-span-2">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ethereal-on-surface-variant opacity-40" />
                            <input 
                                type="text" 
                                value={keyword} 
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Search by Order ID, Buyer, Email, Listing..." 
                                className="w-full pl-11 pr-4 py-3 bg-ethereal-surface-low border border-transparent rounded-2xl text-sm font-medium focus:bg-gray-900 focus:ring-2 focus:ring-ethereal-primary/20 outline-none transition-all text-white placeholder-gray-500" 
                            />
                        </div>

                        {/* Date Pickers */}
                        <div className="flex gap-2">
                            <input 
                                type="date" 
                                value={fromDate} 
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-1/2 px-4 py-3 bg-ethereal-surface-low border border-transparent rounded-2xl text-xs font-medium focus:bg-gray-900 focus:ring-2 focus:ring-ethereal-primary/20 outline-none text-gray-300" 
                                placeholder="From"
                            />
                            <input 
                                type="date" 
                                value={toDate} 
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-1/2 px-4 py-3 bg-ethereal-surface-low border border-transparent rounded-2xl text-xs font-medium focus:bg-gray-900 focus:ring-2 focus:ring-ethereal-primary/20 outline-none text-gray-300" 
                                placeholder="To"
                            />
                        </div>

                        {/* Presets dropdown */}
                        <select 
                            onChange={(e) => handlePresetChange(e.target.value)}
                            className="px-4 py-3 bg-ethereal-surface-low border border-transparent rounded-2xl text-xs font-black uppercase tracking-widest text-ethereal-on-surface-variant outline-none focus:bg-gray-900 cursor-pointer"
                        >
                            <option value="">Preset Ranges</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="clear">Reset Dates</option>
                        </select>
                    </div>

                    {(keyword || fromDate || toDate) && (
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={clearQueryFilters} 
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant hover:text-ethereal-primary transition-colors"
                            >
                                Reset Query Parameters
                            </button>
                        </div>
                    )}
                </div>

                {/* Ledger Matrix */}
                <div className="glass-card rounded-[2.5rem] border-none overflow-hidden animate-fadeIn">
                    {loading ? (
                        <div className="p-32 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethereal-primary mx-auto"></div>
                            <p className="text-ethereal-on-surface-variant font-black uppercase tracking-[0.3em] mt-8 text-[10px]">Syncing Interledger...</p>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-32 text-center">
                            <div className="w-24 h-24 bg-ethereal-surface-low rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <FiCreditCard className="w-10 h-10 text-ethereal-primary opacity-40" />
                            </div>
                            <h3 className="text-2xl font-bold text-ethereal-on-surface uppercase tracking-tight">No Transactions</h3>
                            <p className="text-ethereal-on-surface-variant font-medium mt-2">No payment records found for the selected criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-ethereal-surface-low border-b border-ethereal-surface">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Transaction ID</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Buyer Entity</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Listing Target</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Value</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant">Timestamp</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ethereal-on-surface-variant text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ethereal-surface">
                                    {payments.map((payment, idx) => (
                                        <tr key={payment.id} className="hover:bg-ethereal-surface-low/50 transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${idx * 0.05}s` }}>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-black tracking-widest uppercase border rounded-full w-fit ${getStatusStyle(payment.status)}`}>
                                                        {getStatusIcon(payment.status)}
                                                        {payment.status}
                                                    </span>
                                                    <span className="text-xs font-mono text-ethereal-on-surface-variant bg-gray-900 border border-ethereal-surface px-2 py-1 rounded select-all w-fit">
                                                        {payment.razorpayOrderId}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-ethereal-primary/10 text-ethereal-primary rounded-[0.8rem] flex items-center justify-center font-black shadow-sm">
                                                        <FiUser className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-ethereal-on-surface leading-tight text-sm">{payment.buyer?.fullName}</p>
                                                        <p className="text-[10px] font-medium text-ethereal-on-surface-variant tracking-wide mt-0.5">{payment.buyer?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 text-ethereal-on-surface-variant opacity-50"><FiList className="w-4 h-4" /></div>
                                                    <div>
                                                        <Link to={`/listings/${payment.listing?.id}-${generateSlug(payment.listing?.title, payment.listing?.cityName || payment.listing?.city)}`} className="font-bold text-sm text-ethereal-primary hover:underline leading-tight block line-clamp-2" target="_blank">
                                                            {payment.listing?.title}
                                                        </Link>
                                                        {payment.listing?.sellerName && (
                                                            <p className="text-[9px] font-bold text-ethereal-on-surface-variant uppercase tracking-widest mt-1 opacity-60">Seller: {payment.listing.sellerName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="font-black text-ethereal-on-surface tracking-tight text-sm">
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-ethereal-on-surface">
                                                        {formatDate(payment.createdAt).split(',')[0]}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-ethereal-on-surface-variant uppercase tracking-widest opacity-60">
                                                        {formatDate(payment.createdAt).split(',')[1]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <button
                                                    onClick={() => handleSync(payment.id)}
                                                    className="px-4 py-2 bg-ethereal-surface-low text-ethereal-primary border border-ethereal-primary/20 rounded-xl text-xs font-bold hover:bg-ethereal-primary hover:text-white transition-all shadow-sm"
                                                    disabled={syncing === payment.id}
                                                >
                                                    {syncing === payment.id ? 'Syncing...' : 'Sync'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Sequential Pagination Layer */}
                    {totalPages > 1 && (
                        <div className="bg-ethereal-surface-low/30 px-10 py-8 border-t border-ethereal-surface flex items-center justify-between">
                            <span className="text-[10px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.3em]">
                                Page {page + 1} <span className="mx-3 opacity-20">/</span> {totalPages}
                            </span>
                            <div className="flex gap-4">
                                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                        className="p-3.5 bg-gray-900 rounded-xl shadow-sm hover:shadow-md disabled:opacity-20 hover:-translate-x-1 transition-all">
                                    <FiChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                                        className="p-3.5 bg-gray-900 rounded-xl shadow-sm hover:shadow-md disabled:opacity-20 hover:translate-x-1 transition-all">
                                    <FiChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPaymentsPage;





