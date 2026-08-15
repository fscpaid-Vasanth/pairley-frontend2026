import { useRef, useEffect } from 'react';
import './OtpInput.css';

/**
 * OTP input, box count set by `length` (defaults to 4, matching
 * OtpService.generateOtp()). Controlled by a single string `value` so
 * callers don't need to manage per-digit state. `onComplete`, when passed,
 * fires once as soon as `value` reaches `length` digits.
 */
export default function OtpInput({ length = 4, value, onChange, onComplete, autoFocus = true, disabled = false, variant = 'dark' }) {
  const digits = Array.from({ length }, (_, i) => value[i] || '');
  const refs = useRef(Array.from({ length }, () => null));
  const firedRef = useRef(false);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (value.length === length) {
      if (!firedRef.current) {
        firedRef.current = true;
        onComplete?.(value);
      }
    } else {
      firedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length]);

  const setDigit = (index, digit) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(''));
  };

  const handleChange = (index, e) => {
    const clean = e.target.value.replace(/\D/g, '').slice(-1);
    setDigit(index, clean);
    if (clean && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.padEnd(length, '').slice(0, length).replace(/ /g, ''));
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className={`otp-input ${variant === 'light' ? 'otp-input--light' : ''}`}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="otp-input__box"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
