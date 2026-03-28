import React, { useState } from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { User, Mail, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onBack: () => void;
  onSuccess: (nextView: string) => void;
  onClose?: () => void;
}

export const Register: React.FC<RegisterProps> = ({
  onSwitchToLogin,
  onBack,
  onSuccess,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestLogin, setSuggestLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const { register } = useAuth();

  // Password validation requirements
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const validateForm = () => {
    const errors: typeof fieldErrors = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (!isPasswordValid) {
      errors.password = 'Password does not meet requirements';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setSuggestLogin(false);
    setIsSubmitting(true);

    try {
      const result = await register({ name, email, password, password_confirmation: password, role: 'customer' });
      onSuccess(result.nextView);
    } catch (error: any) {
      const fieldErrors = error?.data?.errors;
      if (fieldErrors) {
        const emailErrors = fieldErrors?.email as string[] | string | undefined;
        const normalizedEmailError = Array.isArray(emailErrors) ? emailErrors[0] : emailErrors;
        if (typeof normalizedEmailError === 'string' && normalizedEmailError.toLowerCase().includes('taken')) {
          setErrorMessage('This email is already registered. Please login instead.');
          setSuggestLogin(true);
        } else {
          const firstError = Object.values(fieldErrors)[0] as string[] | string | undefined;
          setErrorMessage(Array.isArray(firstError) ? firstError[0] : 'Registration failed');
        }
      } else {
        setErrorMessage(error.message || 'Registration failed');
        // Highlight fields that might have issues
        if (error.message?.toLowerCase().includes('email')) {
          setFieldErrors(prev => ({ ...prev, email: error.message }));
        }
        if (error.message?.toLowerCase().includes('password')) {
          setFieldErrors(prev => ({ ...prev, password: error.message }));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordRequirementIcon = (isValid: boolean) => (
    isValid ? (
      <Check className="w-3 h-3 text-green-500" />
    ) : (
      <X className="w-3 h-3 text-red-500" />
    )
  );

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our community of travelers"
      activeTab="register"
      onTabChange={(tab) => tab === 'login' && onSwitchToLogin()}
      onBack={onBack}
      onClose={onClose}
    >
      <form className="space-y-3 max-w-sm mx-auto" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="ml-1 text-xs font-medium text-slate-600 dark:text-slate-300">Full Name</label>
          <div className="relative group">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="Enter your full name"
              required
              className={`w-full rounded-lg border py-2.5 pl-3 pr-10 text-xs outline-none transition-all placeholder:text-slate-400 ${
                fieldErrors.name 
                  ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 dark:border-red-400 dark:bg-transparent dark:text-red-400' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-slate-600 dark:bg-transparent dark:text-slate-200'
              }`}
            />
            <User className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
              fieldErrors.name ? 'text-red-500' : 'text-slate-400 group-focus-within:text-primary'
            }`} />
          </div>
          {fieldErrors.name && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
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
                  : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-slate-600 dark:bg-transparent dark:text-slate-200'
              }`}
            />
            <Mail className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
              fieldErrors.email ? 'text-red-500' : 'text-slate-400 group-focus-within:text-primary'
            }`} />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-xs font-medium text-slate-600 dark:text-slate-300">Create Password</label>
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
                  : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-slate-600 dark:bg-transparent dark:text-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            <p>{errorMessage}</p>
            {suggestLogin && (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="mt-2 text-xs font-semibold text-blue-300 hover:underline"
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        <div className="max-w-sm mx-auto">
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
