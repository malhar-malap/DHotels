import React, { useState } from 'react';
import { FiMail, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Seo from '../../components/common/Seo';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    try {
      setLoading(true);
      await contactAPI.submit(formData);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-primary-500/10 py-16">
      <Seo
        title="Contact Us | DHotels24.com"
        description="Get in touch with DHotels24.com to buy, sell, lease or value a hotel, resort, restaurant, café, bar or banquet hall in India."
        path="/contact-us"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-100 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-500">We're here to help you with your hospitality property needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Contact Form / Success State */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5 hover:border-primary-500/30 transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-400 opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity duration-500 pointer-events-none"></div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <FiCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-100 mb-3">Message Sent!</h2>
                <p className="text-gray-400 mb-8 max-w-sm">
                  Thank you for reaching out. We've received your message and will get back to you within 24-48 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-gray-900 font-bold py-3 px-8 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:-translate-y-1"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-100 mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-900/40 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 hover:border-white/20 outline-none transition-all duration-300 placeholder-gray-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-900/40 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 hover:border-white/20 outline-none transition-all duration-300 placeholder-gray-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-900/40 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 hover:border-white/20 outline-none transition-all duration-300 placeholder-gray-500"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                    <textarea
                      rows="4"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-900/40 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 hover:border-white/20 outline-none transition-all duration-300 placeholder-gray-500"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-400 hover:to-primary-300 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(216,87,42,0.3)] hover:shadow-[0_0_30px_rgba(216,87,42,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/5 hover:border-primary-500/30 transition-all duration-500 h-full flex flex-col justify-start relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary-500 to-primary-400 opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity duration-500 pointer-events-none"></div>
              <h2 className="text-2xl font-bold text-gray-100 mb-8 relative z-10">Contact Information</h2>
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-5 group/item">
                  <div className="w-14 h-14 bg-gray-900/40 border border-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover/item:border-primary-500/50 group-hover/item:shadow-[0_0_20px_rgba(216,87,42,0.3)] transition-all duration-300">
                    <FiMail className="w-6 h-6 text-primary-300 group-hover/item:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-100 mb-1 tracking-wider uppercase">Email</h3>
                    <p className="text-gray-400 font-medium hover:text-primary-300 transition-colors cursor-pointer">d@dhotels24.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group/item">
                  <div className="w-14 h-14 bg-gray-900/40 border border-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover/item:border-primary-500/50 group-hover/item:shadow-[0_0_20px_rgba(216,87,42,0.3)] transition-all duration-300">
                    <FiMapPin className="w-6 h-6 text-primary-300 group-hover/item:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-100 mb-1 tracking-wider uppercase">Location</h3>
                    <p className="text-gray-400 font-medium">We're based in Dadar, Mumbai, India - 400028</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
