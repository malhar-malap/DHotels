import React, { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

/**
 * Re-fetches a page's data on demand. `onRefresh` may return a promise; the icon spins until
 * it settles. Errors are reported by the page's own fetch functions, as on first load.
 */
const RefreshButton = ({ onRefresh, className = '' }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const handleClick = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setLastRefreshed(new Date());
    }
  };

  const title = lastRefreshed
    ? `Last refreshed at ${lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : 'Reload the latest data';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={refreshing}
      title={title}
      aria-label="Refresh data"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-60 transition-colors ${className}`}
    >
      <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
      {refreshing ? 'Refreshing' : 'Refresh'}
    </button>
  );
};

export default RefreshButton;
