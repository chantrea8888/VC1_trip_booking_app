import React, { useState } from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
  onBack: () => void;
  onSuccess: (nextView: string) => void;
  onClose?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onBack, onSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const { login } = useAuth();

  const validateForm = () => {
    const errors: typeof fieldErrors = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      onSuccess(result.nextView);
    } catch (error: any) {
      console.error('âŒ Login error:', error);
      setPassword('');
      setErrorMessage(error?.data?.message ?? error?.message ?? 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Please enter your details to sign in to your account."
      activeTab="login"
      onTabChange={(tab) => tab === 'register' && onSwitchToRegister()}
      onBack={onBack}
      onClose={onClose}
    >
      <form className="space-y-3 max-w-sm mx-auto" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="ml-1 text-xs font-medium text-slate-600 dark:text-slate-300">Email Address</label>
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors(prev => ({ ...prev, email: undefined }));
              }}
              placeholder="Enter your email"
              required
              className={`w-full rounded-lg border py-2.5 pl-3 pr-10 text-xs outline-none transition-all placeholder:text-slate-400 ${
                fieldErrors.email 
                  ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 dark:border-red-400 dark:bg-transparent dark:text-red-400' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 dark:border-slate-600 dark:bg-transparent dark:text-slate-200'
              }`}
            />
            <Mail className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
              fieldErrors.email ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400'
            }`} />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="ml-1 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Password</label>
          </div>
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors(prev => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter your password"
              required
              className={`w-full rounded-lg border py-2.5 pl-3 pr-10 text-xs outline-none transition-all placeholder:text-slate-400 ${
                fieldErrors.password 
                  ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 dark:border-red-400 dark:bg-transparent dark:text-red-400' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 dark:border-slate-600 dark:bg-transparent dark:text-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-600 dark:hover:text-slate-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
          )}
          <a href="#" className="ml-auto text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">Forgot password?</a>
        </div>
{/* 
        {errorMessage && (
          // <div className="rounded-md border border-red-400/40 bg-red-500/10 px-2 py-1.5 text-xs text-red-600 dark:text-red-400 max-w-sm mx-auto">
          //   {errorMessage}
          // </div>
        )} */}

        <div className="max-w-sm mx-auto block">
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
