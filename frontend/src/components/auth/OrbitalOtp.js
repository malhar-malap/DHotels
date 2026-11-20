import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import './OrbitalOtp.css';

// Keep in step with --gather-ms / --orbit-ms / --unwind-ms in OrbitalOtp.css
const GATHER_MS = 420;
const ORBIT_MS = 1600;
const UNWIND_MS = 700;
const REDUCED = { gather: 120, orbit: 250, unwind: 200 };
const SUCCESS_HOLD_MS = 1100;
const ERROR_HOLD_MS = 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const reducedMotion = () => typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Verification code entry. The boxes start in a row; when the last digit is typed they glide onto a
 * ring, orbit the hub and spiral into one tile while `onComplete(code)` runs. The tile turns green
 * only if it resolves to true. A false result or a thrown error unwinds the orbit, returns the boxes
 * to the row with red outlines for a second, then clears the code; the caller's own error messages
 * (toasts) are left as they were. Only one verification runs at a time.
 */
const OrbitalOtp = forwardRef(({ length = 6, onComplete, onSuccess, onBusyChange }, ref) => {
  const [digits, setDigits] = useState(() => Array(length).fill(''));
  // idle -> gathering -> orbiting -> success | unwinding -> returning -> error -> idle
  const [phase, setPhase] = useState('idle');
  const [waiting, setWaiting] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  const inputs = useRef([]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const focusBox = (index) => {
    const el = inputs.current[Math.max(0, Math.min(length - 1, index))];
    if (el) el.focus();
  };

  const submit = useCallback(async (code) => {
    if (busy.current) return;
    if (!new RegExp(`^\\d{${length}}$`).test(code)) {
      toast.error(`Please enter the full ${length}-digit verification code`);
      return;
    }
    busy.current = true;
    onBusyChange?.(true);
    document.activeElement?.blur?.();
    setPhase('gathering');

    const reduced = reducedMotion();
    const ms = (normal, key) => (reduced ? REDUCED[key] : normal);
    let verified = false;
    const request = Promise.resolve()
      .then(() => onComplete(code))
      .then((result) => { verified = result === true; })
      .catch(() => { verified = false; });

    await wait(ms(GATHER_MS, 'gather'));
    if (!mounted.current) return;
    setPhase('orbiting');
    await wait(ms(ORBIT_MS, 'orbit'));
    if (!mounted.current) return;
    setWaiting(true);
    await request;
    if (!mounted.current) return;
    setWaiting(false);

    if (verified) {
      setPhase('success');
      await wait(SUCCESS_HOLD_MS);
      if (mounted.current) onSuccess?.();
      return; // stays locked: the caller moves on
    }

    setPhase('unwinding');
    await wait(ms(UNWIND_MS, 'unwind'));
    if (!mounted.current) return;
    setPhase('returning');
    await wait(ms(GATHER_MS, 'gather'));
    if (!mounted.current) return;
    setPhase('error');
    await wait(ERROR_HOLD_MS);
    if (!mounted.current) return;
    setDigits(Array(length).fill(''));
    setPhase('idle');
    busy.current = false;
    onBusyChange?.(false);
    setTimeout(() => focusBox(0), 0);
  }, [length, onBusyChange, onComplete, onSuccess]);

  useImperativeHandle(ref, () => ({ submit: () => submit(digits.join('')) }), [digits, submit]);

  // Writes digits from `index` on (typing, paste or one-time-code autofill) and submits when full
  const fill = (index, text) => {
    if (busy.current) return;
    const incoming = text.replace(/\D/g, '');
    const next = [...digits];
    if (!incoming) {
      next[index] = '';
      setDigits(next);
      return;
    }
    let i = index;
    for (const ch of incoming) {
      if (i >= length) break;
      next[i] = ch;
      i += 1;
    }
    setDigits(next);
    if (next.every(Boolean)) {
      submit(next.join(''));
    } else {
      const firstEmpty = next.findIndex((d) => !d);
      focusBox(firstEmpty === -1 ? i : Math.max(firstEmpty, Math.min(i, length - 1)));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      focusBox(index - 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      focusBox(index + 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      submit(digits.join(''));
    }
  };

  const locked = phase !== 'idle';
  const status = phase === 'success' ? 'Verified'
    : phase === 'error' ? 'Incorrect code'
      : phase === 'idle' ? '' : 'Verifying code…';

  return (
    <div>
      <div className={`otp-orbit is-${phase}`} role="group" aria-label={`${length}-digit verification code`} style={{ '--n': length }}>
        <svg className="otp-orbit__track" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="0.6" />
        </svg>
        <div className="otp-orbit__hub" aria-hidden="true" />

        <div className="otp-orbit__ring">
          {digits.map((digit, index) => {
            // Row: left to right, centred. Ring seat: first digit on the left, then clockwise, so the
            // row curls into the circle without boxes crossing paths.
            const angle = (270 + (360 / length) * index) % 360;
            const rad = (angle * Math.PI) / 180;
            const seat = {
              '--a': `${angle}deg`,
              '--k': index - (length - 1) / 2,
              '--sin': Math.sin(rad).toFixed(4),
              '--cos': Math.cos(rad).toFixed(4),
            };
            return (
            <div key={index} className="otp-orbit__lane" style={seat}>
            <div className="otp-orbit__arm">
              <div className="otp-orbit__slot">
                <div className="otp-orbit__upright">
                  <input
                    ref={(el) => { inputs.current[index] = el; }}
                    className={`otp-orbit__box${digit ? ' is-filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    autoFocus={index === 0}
                    maxLength={index === 0 ? length : 1}
                    value={digit}
                    readOnly={locked}
                    tabIndex={locked ? -1 : 0}
                    aria-label={`Digit ${index + 1} of ${length}`}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const v = e.target.value;
                      // Typing over a filled box gives "old+new" or "new+old": keep the new digit
                      fill(index, digit && v.length === 2 ? (v[0] === digit ? v[1] : v[0]) : v);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => { e.preventDefault(); fill(index, e.clipboardData.getData('text')); }}
                  />
                </div>
              </div>
            </div>
            </div>
            );
          })}
        </div>

        <div className="otp-orbit__tile" aria-hidden="true">
          {phase === 'success' ? (
            <svg className="otp-orbit__check" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : waiting ? <span className="otp-orbit__spinner" /> : null}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{status}</p>
    </div>
  );
});

OrbitalOtp.displayName = 'OrbitalOtp';

export default OrbitalOtp;
