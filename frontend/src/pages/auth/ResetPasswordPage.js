import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Seo from '../../components/common/Seo';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Extract email and otp from URL search params
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const otp = queryParams.get('otp');

  useEffect(() => {
    if (!email || !otp) {
      toast.error('Invalid password reset link');
      navigate('/login');
    }
  }, [email, otp, navigate]);

  const validatePassword = (pass) => {
    const minLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    return { minLength, hasUpper, hasLower, hasNumber };
  };

  const passwordStrength = validatePassword(formData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordStrength.minLength || !passwordStrength.hasUpper || !passwordStrength.hasLower || !passwordStrength.hasNumber) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({
        email,
        otp,
        newPassword: formData.newPassword
      });
      setSuccess(true);
      toast.success('Password changed successfully!');
      setTimeout(() => navigate('/login'), 5000);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 bg-mesh relative w-full flex items-center justify-center py-12 px-4 md:px-8 text-gray-100 overflow-hidden">
        <Seo title="Reset Password | DHotels24.in" path="/reset-password" noindex />
        {/* Decorative glow elements */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none z-0" />
        <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="max-w-md w-full p-2 relative z-10 animate-fadeIn">
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md text-center relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-500 to-primary-500" />
            
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <FiCheckCircle className="h-7 w-7 text-emerald-500" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-100 tracking-tighter mb-2">Success!</h2>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              Your credentials have been successfully updated. You may now sign in using your new credentials.
            </p>
            
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-6">
              Redirecting you to security vault in 5 seconds...
            </p>
            
            <Link to="/login" className="w-full inline-flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black uppercase tracking-widest text-white bg-gradient-to-r from-primary-500 to-primary-500 hover:from-primary-600 hover:to-primary-600 transition-all">
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 bg-mesh relative w-full flex items-center justify-center py-12 px-4 md:px-8 text-gray-100 overflow-hidden">
      <Seo title="Reset Password | DHotels24.in" path="/reset-password" noindex />
      {/* Decorative glow elements */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Left Pane (Intro) */}
        <div className="flex-1 hidden md:flex flex-col items-start justify-center p-6 text-left space-y-6">
          <Link to="/" className="flex items-center gap-3 mb-2">
            <img src="/images/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] opacity-40">dhotels24.in</span>
          </Link>
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white tracking-tighter leading-[1.05]">
              Update <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-500">Security</span>.
            </h1>
            <p className="text-base text-gray-400 leading-relaxed max-w-sm">
              Please enter your new cryptographic password ensuring it meets robust complexity standards.
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-4 px-4 py-2.5 bg-gray-900/60 border border-gray-800/80 rounded-2xl shadow-lg backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Locked with Multi-factor Authentication</span>
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
                <span className="text-[9px] font-black text-white uppercase tracking-[0.3em] opacity-40">dhotels24.in</span>
              </Link>
            </div>

            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-black text-gray-100 tracking-tighter">
                Set <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-500">Password</span>
              </h2>
              <p className="text-xs text-gray-500 mt-2">Resetting password for <span className="font-extrabold text-primary-400 break-all">{email}</span></p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-4 text-primary-500/80 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-primary-400 transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="h-4 h-4" /> : <FiEye className="h-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-4 text-primary-500/80 w-4 h-4" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-950/50 p-4 border border-gray-800/80 rounded-2xl space-y-2">
                <Requirement met={passwordStrength.minLength} text="At least 8 characters" />
                <Requirement met={passwordStrength.hasUpper} text="Contains uppercase letter" />
                <Requirement met={passwordStrength.hasLower} text="Contains lowercase letter" />
                <Requirement met={passwordStrength.hasNumber} text="Contains a number" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black uppercase tracking-widest text-white bg-gradient-to-r from-primary-500 to-primary-500 hover:from-primary-600 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  'Set New Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Requirement = ({ met, text }) => (
  <div className={`flex items-center text-[10px] font-bold uppercase tracking-wide ${met ? 'text-emerald-500' : 'text-gray-500'}`}>
    {met ? <FiCheck className="mr-2 h-3.5 w-3.5" /> : <FiX className="mr-2 h-3.5 w-3.5" />}
    <span>{text}</span>
  </div>
);

export default ResetPasswordPage;



