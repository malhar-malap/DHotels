import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Seo from '../../components/common/Seo';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      toast.success('Verification link sent to your email!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 bg-mesh relative w-full flex items-center justify-center py-12 px-4 md:px-8 text-gray-100 overflow-hidden">
      <Seo title="Forgot Password | DHotels24.com" path="/forgot-password" noindex />
      {/* Decorative glow elements */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Left Pane (Intro) */}
        <div className="flex-1 hidden md:flex flex-col items-start justify-center p-6 text-left space-y-6">
          <Link to="/" className="flex items-center gap-3 mb-2">
            <img src="/images/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] opacity-40">dhotels24.com</span>
          </Link>
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white tracking-tighter leading-[1.05]">
              Recover <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-500">Access</span>.
            </h1>
            <p className="text-base text-gray-400 leading-relaxed max-w-sm">
              We'll dispatch secure authorization credentials instantly to guide your account restoration.
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-4 px-4 py-2.5 bg-gray-900/60 border border-gray-800/80 rounded-2xl shadow-lg backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Secure AES-256 OTP Authentication</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane (Card) */}
        <div className="flex-1 w-full max-w-md p-2">
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300 focus-within:border-gray-700">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-500 to-primary-500" />
            
            {/* Header logo on mobile */}
            <div className="flex justify-center md:hidden mb-6">
              <Link to="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.3em] opacity-40">dhotels24.com</span>
              </Link>
            </div>

            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-black text-gray-100 tracking-tighter">
                Forgot <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-500">Password?</span>
              </h2>
              <p className="text-xs text-gray-500 mt-2">No worries, we'll send you reset instructions.</p>
            </div>

            {!submitted ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-4 text-primary-500/80 w-4 h-4" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm"
                      placeholder="you@yourhotel.com"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black uppercase tracking-widest text-white bg-gradient-to-r from-primary-500 to-primary-500 hover:from-primary-600 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                  <FiCheckCircle className="h-7 w-7 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-100 tracking-tight">Check your inbox</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  We've sent a secure password reset link to:<br/>
                  <span className="font-extrabold text-primary-400 text-sm break-all">{email}</span>
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-primary-400 font-bold hover:text-primary-500 transition-colors uppercase tracking-wider underline underline-offset-4"
                  >
                    Didn't receive email? Try again
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-800/80 text-center">
              <Link to="/login" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-primary-400 transition-colors">
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;



