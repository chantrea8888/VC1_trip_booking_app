import React, { useState } from 'react';
<<<<<<< HEAD
import { AuthLayout } from '../../components/auth/AuthLayout';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
=======
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
>>>>>>> chantrea/feature-customer

interface RegisterProps {
  onSwitchToLogin: () => void;
  onBack: () => void;
<<<<<<< HEAD
  onSuccess: (nextView: string) => void;
  onClose?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onBack, onSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role] = useState<'owner' | 'customer'>('customer');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const result = await register({
        name,
        email,
        password,
        password_confirmation: password,
        role,
      });
      onSuccess(result.nextView);
    } catch (error: any) {
      const fieldErrors = error?.data?.errors;
      if (fieldErrors) {
        const firstError = Object.values(fieldErrors)[0] as string[] | string | undefined;
        setErrorMessage(Array.isArray(firstError) ? firstError[0] : 'Registration failed');
      } else {
        setErrorMessage(error?.data?.message ?? 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
=======
  onSuccess: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onBack, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      login(email, 'customer', { name });
      onSuccess();
>>>>>>> chantrea/feature-customer
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our community of travelers"
      activeTab="register"
      onTabChange={(tab) => tab === 'login' && onSwitchToLogin()}
      onBack={onBack}
<<<<<<< HEAD
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="ml-1 text-sm font-medium text-slate-700">Full Name</label>
          <div className="relative group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
=======
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe" 
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
            />
>>>>>>> chantrea/feature-customer
          </div>
        </div>

        <div className="space-y-1.5">
<<<<<<< HEAD
          <label className="ml-1 text-sm font-medium text-slate-700">Email Address</label>
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
=======
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com" 
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
            />
>>>>>>> chantrea/feature-customer
          </div>
        </div>

        <div className="space-y-1.5">
<<<<<<< HEAD
          <label className="ml-1 text-sm font-medium text-slate-700">Create Password</label>
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
=======
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Create Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
>>>>>>> chantrea/feature-customer
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
<<<<<<< HEAD
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
=======
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
>>>>>>> chantrea/feature-customer
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {errorMessage && (
          <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-[0_10px_20px_rgba(0,82,204,0.3)] transition-all active:scale-[0.98] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
=======
        <button 
          type="submit" 
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-[0.98] mt-4"
        >
          Sign Up
>>>>>>> chantrea/feature-customer
        </button>
      </form>
    </AuthLayout>
  );
};
