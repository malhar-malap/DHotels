import React, { useEffect, useRef, useState } from 'react';
import { FiUser, FiPhone, FiBriefcase, FiCheckCircle, FiX } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

export const ROLE_OPTIONS = [
  { value: 'SELLER', label: 'Owner / Lister', description: 'List hotels, restaurants or venues for lease' },
  { value: 'BUYER', label: 'Operator / Lessee', description: 'Browse listings and send inquiries' },
  { value: 'EMPLOYER', label: 'Employer', description: 'Post hospitality job openings' },
  { value: 'JOB_SEEKER', label: 'Job Seeker', description: 'Find and apply for hospitality jobs' },
];

// Fetched once per page load: whether Google sign-in is on and the public client ID
let configPromise = null;
const loadConfig = () => {
  if (!configPromise) {
    configPromise = authAPI.googleConfig()
      .then((res) => res.data?.data || { enabled: false })
      .catch(() => { configPromise = null; return { enabled: false }; });
  }
  return configPromise;
};

let scriptPromise = null;
const loadGsi = () => {
  if (window.google?.accounts?.id) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => { scriptPromise = null; resolve(false); };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
};

const inputClass = 'w-full pl-12 pr-4 py-3 bg-gray-950/40 border border-gray-800/80 rounded-xl text-gray-200 placeholder-gray-600 font-bold focus:ring-2 focus:ring-primary-500/80 focus:border-transparent outline-none transition-all duration-300';

/** Asks a new Google user for what every account needs: a mobile number and at least one role. */
const CompleteProfile = ({ signup, onDone, onCancel }) => {
  const { googleRegister } = useAuth();
  const [form, setForm] = useState({ fullName: signup.fullName || '', mobileNumber: '', companyName: '', roles: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };
  const toggleRole = (role) => set('roles', form.roles.includes(role) ? form.roles.filter((r) => r !== role) : [...form.roles, role]);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.fullName.trim().length < 2) next.fullName = 'Full name must be at least 2 characters';
    if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) next.mobileNumber = 'Enter a 10-digit Indian mobile number';
    if (form.roles.length === 0) next.roles = 'Select at least one role';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    const result = await googleRegister({ signupToken: signup.signupToken, ...form, fullName: form.fullName.trim() });
    setSaving(false);
    if (result.success) onDone();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="google-profile-title">
      <form onSubmit={submit} className="relative my-8 w-full max-w-md rounded-3xl border border-gray-800/80 bg-gray-900 p-6 text-left shadow-2xl md:p-8">
        <button type="button" onClick={onCancel} className="absolute right-4 top-4 text-gray-500 hover:text-gray-200" aria-label="Cancel"><FiX className="h-5 w-5" /></button>
        <h2 id="google-profile-title" className="text-2xl font-black tracking-tight text-gray-100">One last step</h2>
        <p className="mt-2 text-xs text-gray-400">Signing up as <span className="font-bold text-gray-200">{signup.email}</span>. Add your contact number and how you’ll use DHotels24.com.</p>

        <div className="mt-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="g-fullName" className="block text-xs font-bold uppercase tracking-wider text-gray-400">Full name</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-3.5 h-4 w-4 text-primary-500/80" />
              <input id="g-fullName" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputClass} maxLength={100} />
            </div>
            {errors.fullName && <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">{errors.fullName}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="g-mobile" className="block text-xs font-bold uppercase tracking-wider text-gray-400">Contact number</label>
            <div className="relative">
              <FiPhone className="absolute left-4 top-3.5 h-4 w-4 text-primary-500/80" />
              <input id="g-mobile" inputMode="numeric" value={form.mobileNumber} onChange={(e) => set('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} className={inputClass} placeholder="9876543210" />
            </div>
            {errors.mobileNumber && <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">{errors.mobileNumber}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="g-company" className="block text-xs font-bold uppercase tracking-wider text-gray-400">Company <span className="normal-case text-gray-600">(optional)</span></label>
            <div className="relative">
              <FiBriefcase className="absolute left-4 top-3.5 h-4 w-4 text-primary-500/80" />
              <input id="g-company" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} className={inputClass} maxLength={200} />
            </div>
          </div>
          <div>
            <p className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">I am a…</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ROLE_OPTIONS.map((role) => {
                const active = form.roles.includes(role.value);
                return (
                  <button key={role.value} type="button" onClick={() => toggleRole(role.value)} aria-pressed={active}
                    className={`relative rounded-xl border p-3 text-left transition-all ${active ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-gray-800 bg-gray-950/40 text-gray-400 hover:border-gray-700'}`}>
                    <span className="block text-[11px] font-bold uppercase tracking-wider">{role.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-snug text-gray-500">{role.description}</span>
                    {active && <FiCheckCircle className="absolute right-2.5 top-2.5 h-4 w-4 text-primary-400" />}
                  </button>
                );
              })}
            </div>
            {errors.roles && <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-red-400">{errors.roles}</p>}
          </div>
        </div>

        <button type="submit" disabled={saving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg transition hover:bg-primary-600 disabled:opacity-50">
          {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : 'Create account'}
        </button>
      </form>
    </div>
  );
};

/**
 * "Continue with Google" button (Google Identity Services). Existing accounts are signed in straight
 * away; new ones finish in a short profile step. Renders nothing while Google sign-in is switched off.
 */
const GoogleSignIn = ({ onSuccess, context = 'signin' }) => {
  const { googleSignIn } = useAuth();
  const buttonRef = useRef(null);
  const handlerRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signup, setSignup] = useState(null);

  handlerRef.current = async ({ credential }) => {
    setBusy(true);
    const result = await googleSignIn(credential);
    setBusy(false);
    if (result.needsProfile) setSignup(result);
    else if (result.success) onSuccess?.();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const config = await loadConfig();
      if (cancelled || !config.enabled || !config.clientId) return;
      setEnabled(true);
      if (!(await loadGsi()) || cancelled || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: config.clientId,
        callback: (response) => handlerRef.current(response),
        context,
        ux_mode: 'popup',
        itp_support: true,
      });
      const width = Math.min(400, Math.max(200, buttonRef.current.offsetWidth || 320));
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard', theme: 'filled_black', size: 'large', shape: 'pill',
        text: context === 'signup' ? 'signup_with' : 'continue_with', logo_alignment: 'center', width,
      });
    })();
    return () => { cancelled = true; };
  }, [context]);

  if (!enabled) return null;

  return (
    <div>
      <div className="relative flex min-h-[44px] items-center justify-center">
        {/* The site is color-scheme: dark; Google's iframe is light, and a mismatch makes browsers paint a
            white box behind it. Matching the iframe's scheme keeps it transparent around the pill. */}
        <div ref={buttonRef} className="flex w-full justify-center" style={{ colorScheme: 'light' }} />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-950/70">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-primary-400" />
          </div>
        )}
      </div>
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-800" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">or with email</span>
        <div className="h-px flex-1 bg-gray-800" />
      </div>
      {signup && <CompleteProfile signup={signup} onCancel={() => setSignup(null)} onDone={() => { setSignup(null); onSuccess?.(); }} />}
    </div>
  );
};

export default GoogleSignIn;
