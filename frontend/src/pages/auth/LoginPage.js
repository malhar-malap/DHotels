import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getRedirectTarget } from '../../utils/authRedirect';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Seo from '../../components/common/Seo';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const redirect = getRedirectTarget(location.search);

    useEffect(() => { if (isAuthenticated) navigate(redirect); }, [isAuthenticated, navigate, redirect]);

    const validateForm = () => {
        const e = {};
        if (!formData.email) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email format';
        if (!formData.password) e.password = 'Password is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        const result = await login(formData);
        setLoading(false);
        if (result.success) navigate(redirect);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

  return (
    <div className="min-h-screen bg-gray-950 bg-mesh relative w-full flex items-center justify-center py-12 px-4 md:px-8 text-gray-100 overflow-hidden">
      <Seo title="Login | DHotels24.com" path="/login" noindex />
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
              Welcome back to <span className="text-gradient">DHotels24.com</span>.
            </h1>
            <p className="text-base text-gray-400 leading-relaxed max-w-sm">
              Pick up where you left off — your saved listings, unlocked contacts and enquiries are waiting.
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-4 px-4 py-2.5 bg-gray-900/60 border border-gray-800/80 rounded-2xl shadow-lg backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Every listing reviewed before it goes live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane (Login Card) */}
        <div className="flex-1 w-full max-w-md p-2">
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300 focus-within:border-gray-700">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-500 to-primary-500" />
            
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-black text-gray-100 tracking-tighter">
                Sign <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-500">In</span>
              </h2>
              <p className="text-xs text-gray-500 mt-2">Welcome back! Please enter your details below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-4 text-primary-500/80 w-4 h-4" />
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                    placeholder="you@yourhotel.com" 
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-[10px] font-bold text-primary-500 hover:text-primary-600 uppercase tracking-wider transition-colors">Recover Password</Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-4 text-primary-500/80 w-4 h-4" />
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password} 
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm ${errors.password ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-amber-500 hover:text-primary-500 transition-colors">
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{errors.password}</p>}
              </div>

              {/* Remember Login */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer group/check select-none">
                  <div className="relative">
                    <input type="checkbox" className="peer w-4 h-4 opacity-0 absolute cursor-pointer" />
                    <div className="w-4 h-4 rounded-md border border-gray-800 bg-gray-950/40 peer-checked:bg-primary-500 peer-checked:border-primary-500 flex items-center justify-center transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="ml-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover/check:text-gray-200 transition-colors">Remember Login</span>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-500 text-white font-bold rounded-xl shadow-lg hover:from-primary-600 hover:to-primary-600 hover:shadow-primary-500/10 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em]"
              >
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" /> : <>Login <FiLock className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Don't have an account?</p>
            <Link to={location.search ? `/register${location.search}` : '/register'} className="px-5 py-2 border border-gray-800 hover:border-gray-700 text-primary-500 hover:text-primary-600 text-[10px] font-bold uppercase tracking-wider rounded-xl transition bg-gray-950/20 inline-block">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;





