import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiSearch, FiFilter, FiActivity, FiClock, FiUser, FiInfo, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 0, size: 20, totalPages: 0, totalElements: 0 });
  const [filters, setFilters] = useState({
    user: '',
    action: ''
  });
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

  const fetchLogs = async (page = 0) => {
    try {
      setLoading(true);
      const params = { page, size: pagination.size };
      if (filters.user) params.user = filters.user;
      if (filters.action) params.action = filters.action;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await adminAPI.getAuditLogs(params);
      const data = res.data.data;
      setLogs(data.content || []);
      setPagination(prev => ({
        ...prev,
        page: data.number,
        totalPages: data.totalPages,
        totalElements: data.totalElements
      }));
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, []);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = () => {
    fetchLogs(0);
  };

  const clearFilters = () => {
    setFilters({ user: '', action: '' });
    setFromDate('');
    setToDate('');
    setTimeout(() => {
      const fetchCleared = async () => {
        try {
          setLoading(true);
          const res = await adminAPI.getAuditLogs({ page: 0, size: pagination.size });
          const data = res.data.data;
          setLogs(data.content || []);
          setPagination(prev => ({
            ...prev,
            page: data.number,
            totalPages: data.totalPages,
            totalElements: data.totalElements
          }));
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchCleared();
    }, 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const dateStr = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <Link to="/admin" className="p-2 rounded-xl bg-gray-900/50 text-[#c9c9c9] hover:text-[#db7c26] transition-all duration-300">
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <span className="section-label tracking-[0.2em]">Governance Module</span>
            </div>
            <h1 className="text-4xl display-title uppercase tracking-tighter">System Audit Logs</h1>
            <p className="text-gray-400 mt-1">Track high-value user and system actions.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 rounded-2xl border-none space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="w-full relative">
              <label className="block text-xs font-medium text-gray-400 mb-1">Filter by User ID or Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  name="user"
                  value={filters.user}
                  onChange={handleFilterChange}
                  placeholder="e.g. 42 or Manas" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-[#db7c26] text-gray-200 text-sm"
                />
              </div>
            </div>
            <div className="w-full relative">
              <label className="block text-xs font-medium text-gray-400 mb-1">Filter by Action</label>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                  placeholder="e.g. VERIFY_PAYMENT" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-[#db7c26] text-gray-200 text-sm"
                />
              </div>
            </div>

            {/* Date Pickers */}
            <div className="w-full relative">
              <label className="block text-xs font-medium text-gray-400 mb-1">Date Range</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-1/2 px-3 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-[#db7c26] text-gray-200 text-xs" 
                  placeholder="From"
                />
                <input 
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-1/2 px-3 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-[#db7c26] text-gray-200 text-xs" 
                  placeholder="To"
                />
              </div>
            </div>

            {/* Presets and select */}
            <div className="w-full relative">
              <label className="block text-xs font-medium text-gray-400 mb-1">Preset Ranges</label>
              <select 
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-xs font-black uppercase tracking-widest text-[#c9c9c9] outline-none focus:border-[#db7c26] cursor-pointer"
              >
                <option value="">Preset Ranges</option>
                <option value="24h">Last 24 Hours</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="clear">Reset Dates</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={applyFilters} className="btn-gradient px-6 py-2.5 rounded-xl font-semibold text-sm">
              Filter
            </button>
            <button onClick={clearFilters} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors text-sm">
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl border-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/40 text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="p-4 font-semibold w-24">Log ID</th>
                  <th className="p-4 font-semibold">Actor</th>
                  <th className="p-4 font-semibold">Action</th>
                  <th className="p-4 font-semibold">Target / Entity</th>
                  <th className="p-4 font-semibold">Details / IP</th>
                  <th className="p-4 font-semibold w-48">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#db7c26]"></div>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-gray-300">#{log.id}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-200">
                            {log.actorName || `User`}
                          </span>
                          <span className="text-[10px] text-gray-500">ID: {log.userId || '—'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-[#db7c26]/10 text-[#db7c26] border border-[#db7c26]/20 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-200">
                            {log.targetName || log.entityType || '—'}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {log.entityType} {log.entityId && `(ID: ${log.entityId})`}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-300 truncate max-w-[200px]" title={log.details}>
                            {log.details || '—'}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">{log.ipAddress}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-gray-400">{formatDate(log.timestamp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center p-4 bg-gray-900/20 border-t border-white/5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Page {pagination.page + 1} of {pagination.totalPages} ({pagination.totalElements} entries)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page === 0}
                  onClick={() => fetchLogs(pagination.page - 1)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Prev
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages - 1}
                  onClick={() => fetchLogs(pagination.page + 1)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogsPage;
