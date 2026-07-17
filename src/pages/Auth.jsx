import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, forgotPassword, resetPassword } = useAuth();
  
  // 'login' | 'register' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Interactive UI states
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetFormStates = () => {
    setName('');
    setEmail('');
    setPassword('');
    confirmPassword !== '' && setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleModeChange = (newMode) => {
    resetFormStates();
    setMode(newMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const success = login(email, password);
        if (success) {
          navigate('/dashboard');
        }
      } else if (mode === 'register') {
        const success = register({ name, email, password, confirmPassword });
        if (success) {
          setSuccess('Account created successfully! Logging you in...');
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      } else if (mode === 'forgot') {
        const success = forgotPassword(email);
        if (success) {
          setSuccess('Password reset link sent to your email.');
          // Automatically transition to reset password view for mockup simulation purposes after a short delay
          setTimeout(() => handleModeChange('reset'), 2000);
        }
      } else if (mode === 'reset') {
        const success = resetPassword(password, confirmPassword);
        if (success) {
          setSuccess('Password reset successful! You can now login.');
          setTimeout(() => handleModeChange('login'), 2000);
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-200">
      {/* Decorative agronomy-inspired elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 dark:bg-emerald-950/10 rounded-full filter blur-[80px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sky-100/30 dark:bg-sky-950/10 rounded-full filter blur-[80px]"></div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xl p-8 relative z-10 transition-all duration-200">
        
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-100 dark:bg-emerald-950/50 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-3 shadow-inner">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">HydroSmart</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 text-center">
            {mode === 'login' && 'Manage your smart farm irrigation systems'}
            {mode === 'register' && 'Create your farmer portal account'}
            {mode === 'forgot' && 'Reset your farm management credentials'}
            {mode === 'reset' && 'Establish a new secure password'}
          </p>
        </div>

        {/* Validation Errors & Messages */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* REGISTER: Name input */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Farmer John"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                />
              </div>
            </div>
          )}

          {/* LOGIN & REGISTER & FORGOT: Email input */}
          {mode !== 'reset' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                />
              </div>
            </div>
          )}

          {/* LOGIN & REGISTER & RESET: Password input */}
          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="password">
                {mode === 'reset' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* REGISTER & RESET: Confirm Password input */}
          {(mode === 'register' || mode === 'reset') && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                />
              </div>
            </div>
          )}

          {/* LOGIN: Remember Me & Forgot Password link */}
          {mode === 'login' && (
            <div className="flex items-center justify-between text-sm py-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-850 dark:border-slate-700 w-4 h-4"
                />
                <span>Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => handleModeChange('forgot')}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all focus:ring-4 focus:ring-emerald-500/30 shadow-md shadow-emerald-600/10 flex justify-center items-center gap-2 mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
                {mode === 'reset' && 'Reset Password'}
              </>
            )}
          </button>
        </form>

        {/* Auth Mode Footer switches */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
          {mode === 'login' && (
            <p>
              New to HydroSmart?{' '}
              <button
                onClick={() => handleModeChange('register')}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline bg-transparent"
              >
                Register here
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => handleModeChange('login')}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline bg-transparent"
              >
                Sign In
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button
              onClick={() => handleModeChange('login')}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          )}
          {mode === 'reset' && (
            <button
              onClick={() => handleModeChange('login')}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
