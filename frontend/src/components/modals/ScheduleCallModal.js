import React, { useState } from 'react';
import { FiX, FiPhone, FiUser, FiMail, FiCalendar, FiClock, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ScheduleCallModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    timeSlot: '30_MIN',
    topic: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: val });
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(formData.phone)) return 'Phone number must be exactly 10 digits';
    if (!formData.preferredDate) return 'Preferred date is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        phone: `+91${formData.phone}`
      };
      await api.post('/consultations/schedule', payload);
      toast.success('Call request submitted successfully! Our team will reach out to confirm.');
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-gray-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 sticky top-0 bg-gray-900/95 backdrop-blur-md z-10 rounded-t-[2.5rem]">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
              <FiPhone className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">Schedule a Call</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Book a free consultation with our hospitality deal advisors
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FiCheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Request Submitted!</h3>
              <p className="text-gray-400">Our team will reach out to confirm your slot.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiUser />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 px-4 py-2.5 focus:outline-none focus:border-primary-400"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiMail />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 px-4 py-2.5 focus:outline-none focus:border-primary-400"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-gray-700 bg-gray-800 text-gray-400 text-sm font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-r-lg px-4 py-2.5 focus:outline-none focus:border-primary-400"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiCalendar />
                    </div>
                    <input
                      type="date"
                      name="preferredDate"
                      min={today}
                      value={formData.preferredDate}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 px-4 py-2.5 focus:outline-none focus:border-primary-400 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Time Slot</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FiClock />
                    </div>
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 px-4 py-2.5 focus:outline-none focus:border-primary-400 appearance-none"
                    >
                      <option value="30_MIN">30 Minutes</option>
                      <option value="60_MIN">60 Minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Topic / Notes (Optional)</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 text-gray-500 pointer-events-none">
                    <FiMessageSquare />
                  </div>
                  <textarea
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 px-4 py-2.5 focus:outline-none focus:border-primary-400 resize-none"
                    placeholder="Briefly describe what you'd like to discuss..."
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-700 hover:to-primary-700 text-white font-medium py-3 rounded-lg transition-all shadow-lg hover:shadow-primary-400/20 disabled:opacity-70 flex justify-center items-center mt-6"
              >
                {loading ? 'Submitting...' : 'Confirm Call Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCallModal;
