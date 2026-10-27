import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { userAPI, mediaAPI } from '../services/api';
import { FiUploadCloud, FiShield } from 'react-icons/fi';

const VerificationModal = ({ isOpen, onClose, onSuccess }) => {
  const [docType, setDocType] = useState('AADHAAR');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a document to upload');
      return;
    }
    
    setSubmitting(true);
    try {
      // 1. Upload the file
      const uploadRes = await mediaAPI.upload(file);
      const docUrl = uploadRes.data.data;

      // 2. Submit verification request
      await userAPI.submitVerification({ docType, docUrl });
      
      toast.success('KYC Document submitted. Please wait up to 24 hours for approval.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ethereal-surface/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="glass-card bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10 md:p-12 animate-scaleIn relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-ethereal-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex flex-col items-center text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-ethereal-primary to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 transform -rotate-3">
            <FiShield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl display-title uppercase tracking-tighter mb-3">Identity Protocol</h2>
          <p className="text-xs font-bold text-ethereal-on-surface-variant opacity-60 uppercase tracking-widest max-w-xs mx-auto">
            Submit institutional credentials to validate your professional entity in the ecosystem.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="section-label ml-1 opacity-60">Credential Type</label>
            <select 
              value={docType} 
              onChange={e => setDocType(e.target.value)}
              className="w-full bg-ethereal-surface-low border border-ethereal-outline-variant/30 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-ethereal-primary/5 focus:border-ethereal-primary focus:outline-none transition-all text-ethereal-on-surface font-medium appearance-none"
            >
              <option value="AADHAAR">Aadhaar Card (National ID)</option>
              <option value="PAN">PAN Card (Tax Identity)</option>
              <option value="PASSPORT">Passport (Global Identity)</option>
            </select>
          </div>
          
          <div className="space-y-3">
            <label className="section-label ml-1 opacity-60">Validation Archetype</label>
            <div className="group relative">
              <input 
                type="file" 
                id="file-upload" 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,.pdf" 
              />
              <label 
                htmlFor="file-upload" 
                className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-[2rem] transition-all cursor-pointer ${
                  file ? 'bg-[#E3FCF9]/50 border-[#f7b538]' : 'bg-ethereal-surface-low border-ethereal-outline-variant/30 hover:bg-gray-900 hover:border-ethereal-primary/50'
                }`}
              >
                <div className="flex flex-col items-center p-6 text-center">
                  <FiUploadCloud className={`w-10 h-10 mb-4 transition-colors ${file ? 'text-[#d8572a]' : 'text-ethereal-primary opacity-40 group-hover:opacity-100'}`} />
                  {file ? (
                    <div className="animate-fadeIn">
                      <p className="text-sm font-black text-[#db7c26] mb-1">{file.name}</p>
                      <p className="text-[10px] font-bold text-[#d8572a] uppercase tracking-widest">Archetype Selected</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-black text-ethereal-on-surface mb-1">Upload Credential Image</p>
                      <p className="text-[10px] font-bold text-ethereal-on-surface-variant opacity-40 uppercase tracking-widest">PNG, JPG, PDF (MAX 5MB)</p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-ethereal-surface-low text-ethereal-on-surface-variant py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-ethereal-outline-variant/20 transition-all"
            >
              Terminate
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex-1 bg-ethereal-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? 'Executing...' : 'Submit Protocol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationModal;





