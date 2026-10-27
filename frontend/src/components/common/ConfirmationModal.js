import React, { useState } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false,
    requireReason = false,
    reasonLabel = "Reason for this action"
}) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (requireReason) {
            onConfirm(reason);
        } else {
            onConfirm();
        }
        setReason("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-ethereal-surface border border-ethereal-surface-light rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-ethereal-on-surface-variant hover:text-white transition-colors"
                >
                    <FiX size={24} />
                </button>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-2xl ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-ethereal-primary/10 text-ethereal-primary'}`}>
                        <FiAlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tighter">
                        {title}
                    </h2>
                </div>
                
                <p className="text-ethereal-on-surface mb-8 font-medium leading-relaxed opacity-80">
                    {message}
                </p>

                {requireReason && (
                    <div className="mb-8">
                        <label className="block text-[10px] font-black text-ethereal-on-surface-variant uppercase tracking-[0.2em] mb-2">
                            {reasonLabel}
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-2xl p-4 min-h-[100px] focus:outline-none focus:border-ethereal-primary transition-colors"
                            placeholder="Please provide a brief reason..."
                        />
                    </div>
                )}
                
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-ethereal-surface-light text-white rounded-[1.5rem] font-bold tracking-wide hover:bg-ethereal-surface transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={requireReason && !reason.trim()}
                        className={`flex-1 py-4 text-white rounded-[1.5rem] font-bold tracking-wide transition-colors ${
                            requireReason && !reason.trim() ? 'opacity-50 cursor-not-allowed ' : 'hover:opacity-90 '
                        } ${isDanger ? 'bg-red-600' : 'bg-ethereal-primary'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
