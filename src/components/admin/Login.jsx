import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Mail, ShieldCheck, Clock, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';

export default function Login({ initialEmail, onLoginSuccess, onCancel }) {
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mockOtp, setMockOtp] = useState(null); // Saved OTP for offline dev testing
  const [timer, setTimer] = useState(300); // 5 minutes countdown

  // Handle OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setError('OTP has expired. Please request a new code.');
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Submit email to receive OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');
    setMockOtp(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        setStep(2);
        setTimer(300);
        setMessage(data.message);
        if (data.debugMockOtp) {
          setMockOtp(data.debugMockOtp);
        }
      } else {
        setError(data.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to authentication backend. Ensure port 5000 is active.');
    } finally {
      setLoading(false);
    }
  };

  // Submit OTP for validation
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();
      if (data.success) {
        // Pass token and user details to App component
        onLoginSuccess(data.token, email, data.role, data.companyId, data.org);
      } else {
        setError(data.message || 'Incorrect passcode. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Authentication server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setOtp('');
    setError('');
    setMessage('');
    setMockOtp(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background abstract gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Cancel Navigation */}
      <button 
        onClick={onCancel}
        className="absolute top-8 left-8 flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Return to Landing Page</span>
      </button>

      <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-8 relative z-10">
        
        {/* Header logo / branding */}
        <div className="text-center mb-8">
          <span className="inline-flex p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 mb-4 shadow-sm">
            <KeyRound size={24} />
          </span>
          <h2 className="text-2xl font-extrabold font-display text-slate-900 tracking-tight">
            Syncra Admin Access
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {step === 1 
              ? 'Enter your system email to authorize access' 
              : 'A 6-digit code has been dispatched to your email'
            }
          </p>
        </div>

        {/* Global Feedback Banner */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl mb-6">
            ⚠️ {error}
          </div>
        )}
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl mb-6">
            📧 {message}
          </div>
        )}

        {/* Console OTP Logger for Developer Offline Bypass */}
        {mockOtp && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl mb-6 space-y-1.5 text-xs text-left">
            <div className="font-bold flex items-center">
              <ShieldCheck size={14} className="mr-1 text-indigo-600 animate-pulse" /> Developer Mode Override
            </div>
            <p className="text-slate-600">SMTP mailer host not configured in `.env`. Copy the generated code below to bypass:</p>
            <div className="bg-white border border-indigo-200/80 rounded px-2.5 py-1 text-center text-sm font-mono font-bold tracking-widest text-indigo-700 select-all">
              {mockOtp}
            </div>
          </div>
        )}

        {/* Step 1 Form: Email Submission */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5 text-left">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                Work Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-purple hover:bg-purple-600 disabled:bg-purple-400 rounded-xl text-sm font-bold text-white flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-brand-purple/10"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Requesting Passcode...</span>
                </>
              ) : (
                <span>Request Verification Code</span>
              )}
            </button>
          </form>
        ) : (
          /* Step 2 Form: OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-left">
            <div>
              <label htmlFor="otp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                One-Time Passcode (OTP)
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                required
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-bold font-mono tracking-[8px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple placeholder:text-slate-300"
              />
            </div>

            {/* Timer countdown */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center">
                <Clock size={12} className="mr-1" /> Code expires in: <strong>{formatTime(timer)}</strong>
              </span>
              <button 
                type="button"
                onClick={handleSendOtp}
                disabled={loading || timer > 240} // Allow resending after 1 min
                className="text-brand-purple hover:underline disabled:text-slate-400 disabled:no-underline font-bold cursor-pointer"
              >
                Resend OTP
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || timer === 0}
                className="flex-[2] py-3 bg-brand-purple hover:bg-purple-600 disabled:bg-purple-400 rounded-xl text-sm font-bold text-white flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-brand-purple/10"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Login</span>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
