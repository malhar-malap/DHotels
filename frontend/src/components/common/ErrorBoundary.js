import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.handleReset)
          : this.props.fallback;
      }

      return (
        <div className="min-h-[300px] w-full flex items-center justify-center p-6 my-4">
          <div className="glass-card bg-gray-900/95 border border-rose-500/30 rounded-[2rem] p-8 max-w-xl w-full text-center shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-6">
              <FiAlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">
              Something went wrong
            </h3>
            <p className="text-sm font-medium text-gray-400 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this component. You can reload this section or return to safety without losing your session.
            </p>

            {this.state.error && (
              <div className="bg-black/50 border border-white/5 rounded-xl p-4 mb-6 text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-rose-400 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary-700 transition-all shadow-lg shadow-primary-400/20"
              >
                <FiRefreshCw className="w-4 h-4" /> Try Again
              </button>
              <a
                href="/admin"
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-700 transition-all"
              >
                <FiHome className="w-4 h-4" /> Admin Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
