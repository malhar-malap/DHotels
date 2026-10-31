import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { masterAPI, authAPI } from '../../services/api';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiActivity, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Seo from '../../components/common/Seo';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtpAndRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [step, setStep] = useState(1);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', mobileNumber: '', companyName: '', cityId: '', roles: [] });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const otpInputs = useRef([]);

  const roleOptions = [
    { value: 'SELLER', label: 'Seller / Lister', description: 'List hotels, restaurants or venues for sale or lease' },
    { value: 'BUYER', label: 'Buyer / Investor', description: 'Browse listings and send inquiries' },
    { value: 'EMPLOYER', label: 'Employer', description: 'Post hospitality job openings' },
    { value: 'JOB_SEEKER', label: 'Job Seeker', description: 'Find and apply for hospitality jobs' }
  ];

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName || formData.fullName.length < 2) newErrors.fullName = 'Full name must be at least 2 characters';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) newErrors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.mobileNumber || !/^[6-9]\d{9}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid Indian mobile number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (formData.roles.length === 0) newErrors.roles = 'Please select at least one role';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    try {
      const response = await authAPI.checkAvailability(formData.email, formData.mobileNumber);
      const { emailExists, mobileExists } = response.data.data || {};
      
      const newErrors = {};
      if (emailExists) {
        newErrors.email = 'Email is already registered';
      }
      if (mobileExists) {
        newErrors.mobileNumber = 'Mobile number is already registered';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }
      
      setStep(2);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to validate account details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    const result = await sendOtp(formData.email);
    setLoading(false);

    if (result.success) {
      setStep(3);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    const result = await sendOtp(formData.email);
    setResending(false);
    if (result.success) setOtp(['', '', '', '', '', '']);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== '' && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleVerifyAndRegister = async (e) => {
    if (e) e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the full 6-digit verification code');
      return;
    }

    setLoading(true);
    const registrationData = {
      ...formData,
      otp: otpValue,
      cityId: formData.cityId ? parseInt(formData.cityId) : undefined,
      companyName: formData.companyName || undefined
    };
    delete registrationData.confirmPassword;

    const result = await verifyOtpAndRegister(registrationData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, roles: prev.roles.includes(role) ? prev.roles.filter(r => r !== role) : [...prev.roles, role] }));
    if (errors.roles) setErrors(prev => ({ ...prev, roles: '' }));
  };

  const searchCities = async (query) => {
    if (query.length > 2) {
      try { const response = await masterAPI.searchCities(query); setCities(response.data.data || []); } catch (error) { console.error('Error searching cities:', error); }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 bg-mesh relative w-full flex items-center justify-center py-12 px-4 md:px-8 text-gray-100 overflow-hidden">
      <Seo title="Create an Account | DHotels" path="/register" noindex />
      {/* Decorative glow elements */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center">
            <img src="/images/logo.png" alt="Logo" className="w-12 h-12 object-contain mb-3 transition-transform hover:scale-105" />
          </Link>
          <h2 className="mt-4 text-3xl font-black text-gray-100 tracking-tighter leading-none">
            Create an <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-500">Account</span>
          </h2>
          <p className="mt-3 text-xs font-bold text-gray-500">Join India’s hospitality marketplace.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-6 px-4">
          {[
            { n: 1, l: 'Profile' },
            { n: 2, l: 'Role' },
            { n: 3, l: 'Verify' }
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-500 ${step >= s.n ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-110' : 'bg-gray-900/50 border border-gray-800 text-gray-500 opacity-40'}`}>
                  {step > s.n ? <FiCheckCircle className="w-4 h-4" /> : s.n}
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-widest transition-opacity duration-300 ${step >= s.n ? 'text-gray-200 opacity-100' : 'text-gray-500 opacity-40'}`}>
                  {s.l}
                </span>
              </div>
              {i < 2 && (
                <div className="w-12 h-[1px] mx-3 mb-4 bg-gray-800">
                  <div className={`h-full transition-all duration-700 ${step > s.n ? 'bg-primary-500' : 'bg-gray-800'}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300 focus-within:border-gray-700">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-500 to-primary-500" />

          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <label htmlFor="fullName" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Full Legal Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-3.5 text-primary-500/80 w-4 h-4" />
                  <input 
                    id="fullName" 
                    name="fullName" 
                    type="text" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    className={`w-full pl-12 pr-4 py-3 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm ${errors.fullName ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                    placeholder="E.g., Dr. John Smith" 
                  />
                </div>
                {errors.fullName && <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{errors.fullName}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="mobileNumber" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Contact number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-3.5 text-primary-500/80 w-4 h-4" />
                  <input 
                    id="mobileNumber" 
                    name="mobileNumber" 
                    type="tel" 
                    value={formData.mobileNumber} 
                    onChange={handleChange} 
                    className={`w-full pl-12 pr-4 py-3 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm ${errors.mobileNumber ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                    placeholder="9876543210" 
                    maxLength="10" 
                  />
                </div>
                {errors.mobileNumber && <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{errors.mobileNumber}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Email id</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-primary-500/80 w-4 h-4" />
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={`w-full pl-12 pr-4 py-3 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                    placeholder="you@yourhotel.com" 
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-3.5 text-primary-500/80 w-4 h-4" />
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password} 
                    onChange={handleChange} 
                    className={`w-full pl-12 pr-10 py-3 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm ${errors.password ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-amber-500 hover:text-primary-500 transition-colors">
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{errors.password}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Confirm pasword</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-3.5 text-primary-500/80 w-4 h-4" />
                  <input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className={`w-full pl-12 pr-4 py-3 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm ${errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/50' : ''}`}
                    placeholder="••••••••" 
                  />
                </div>
                {errors.confirmPassword && <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{errors.confirmPassword}</p>}
              </div>

              <button 
                type="button" 
                onClick={handleNext} 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-500 text-white font-bold rounded-xl shadow-lg hover:from-primary-600 hover:to-primary-600 hover:shadow-primary-500/10 transition-all duration-300 flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-2 disabled:opacity-50"
              >
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" /> : 'Continue'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block text-center">Select Your Roles</label>
                <div className="grid grid-cols-1 gap-3">
                  {roleOptions.map((role) => {
                    const isActive = formData.roles.includes(role.value);
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleRoleChange(role.value)}
                        className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden group/role ${
                          isActive 
                            ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_4px_20px_rgba(249,115,22,0.08)] scale-[1.01]' 
                            : 'bg-gray-950/40 border-gray-805 text-gray-500 hover:border-gray-700 hover:text-gray-300'
                        }`}
                      >
                        <div className={`mb-2 text-lg transition-colors ${isActive ? 'text-primary-400' : 'text-gray-600'}`}>
                          <FiActivity className="w-5 h-5" />
                        </div>
                        <span className="block font-bold text-xs uppercase tracking-wider mb-0.5">{role.label}</span>
                        <p className="text-[10px] text-gray-500 leading-normal">{role.description}</p>
                        {isActive && <FiCheckCircle className="absolute top-3 right-3 w-4 h-4 text-primary-400" />}
                      </button>
                    );
                  })}
                </div>
                {errors.roles && <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider text-center mt-3">{errors.roles}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="companyName" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Company / Institution</label>
                <div className="relative">
                  <FiActivity className="absolute left-4 top-3.5 text-primary-500/80 w-4 h-4" />
                  <input 
                    id="companyName" 
                    name="companyName" 
                    type="text" 
                    value={formData.companyName} 
                    onChange={handleChange} 
                    className="w-full pl-12 pr-4 py-3 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm"
                    placeholder="E.g., Seaside Hospitality Pvt Ltd" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="cityId" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">City</label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-3.5 text-primary-500/80 w-4 h-4" />
                  <input 
                    id="cityId" 
                    name="cityId" 
                    list="cities" 
                    type="text" 
                    onChange={(e) => { searchCities(e.target.value); handleChange(e); }} 
                    className="w-full pl-12 pr-4 py-3 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300 shadow-inner backdrop-blur-sm"
                    placeholder="Type to search city" 
                  />
                  <datalist id="cities">
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>{city.name}, {city.state?.name}</option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="px-6 py-4 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-gray-200 text-xs font-bold rounded-xl transition bg-gray-950/20 uppercase tracking-wider"
                >
                  Back
                </button>
                
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-500 text-white font-bold rounded-xl shadow-lg hover:from-primary-600 hover:to-primary-600 hover:shadow-primary-500/10 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  {loading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" /> : 'Send Verification Code'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500/10 to-primary-500/10 border border-primary-500/20 text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/5 animate-pulse">
                <FiMail className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-100 tracking-tighter mb-1">Security Verification</h3>
                <p className="text-[10px] font-bold text-gray-500 leading-normal uppercase tracking-wider">
                  Verification code sent to:<br />
                  <span className="text-primary-400 font-extrabold text-xs tracking-wide">{formData.email}</span>
                </p>
              </div>

              <div className="flex justify-between gap-2 mt-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={el => otpInputs.current[index] = el}
                    value={data}
                    onChange={e => handleOtpChange(e.target, index)}
                    onKeyDown={e => handleOtpKeyDown(e, index)}
                    className="w-full h-12 text-center text-xl font-bold bg-gray-950/40 border border-gray-800 rounded-xl focus:border-primary-500 focus:bg-gray-950 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 outline-none text-gray-200"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerifyAndRegister}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-500 text-white font-bold rounded-xl shadow-lg hover:from-primary-600 hover:to-primary-600 hover:shadow-primary-500/10 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" /> : <>Verify and Register <FiCheckCircle className="w-4 h-4" /></>}
              </button>

              <div className="pt-2 space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Didn't receive code?{' '}
                  <button
                    disabled={resending}
                    onClick={handleResendOtp}
                    className="text-primary-400 hover:text-primary-500 transition-colors uppercase font-extrabold"
                  >
                    {resending ? 'Resending...' : 'Resend Code'}
                  </button>
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="text-[10px] font-bold text-primary-500 hover:text-primary-600 uppercase tracking-wider transition-colors block mx-auto underline"
                >
                  Change Email
                </button>
              </div>
            </div>
          )}
        </div>

        {step < 3 && (
          <p className="mt-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
            Already a member? <Link to="/login" className="text-primary-500 hover:text-primary-600 font-extrabold ml-1 transition-colors">Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;





