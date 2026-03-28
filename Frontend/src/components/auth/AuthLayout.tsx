import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Explore the Wonders of Cambodia",
    subtitle: "Start your unforgettable journey through Cambodia’s rich culture and natural beauty.",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&q=80&w=2000"
  },
  {
    id: 2,
    title: "Discover Angkor Wat",
    subtitle: "Experience the breathtaking sunrise and ancient temples of Angkor.",
    image: "https://images.unsplash.com/photo-1589395937772-f6705e04d7f4?auto=format&fit=crop&q=80&w=2000"
  },
  {
    id: 3,
    title: "Cambodian Nature Adventure",
    subtitle: "From tropical islands to lush jungles, Cambodia is full of adventure.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=2000"
  }
];

interface AuthLayoutProps {
  children: React.ReactNode;
  onBack: () => void;
  onClose?: () => void;
  title: string;
  subtitle: string;
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  activeTab,
  onTabChange,
  onClose = () => {}, // Default empty function
}) => {
  const { isDarkMode } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [oauthError, setOauthError] = useState('');
  const apiProxyTarget = (import.meta as any).env?.VITE_API_PROXY_TARGET as string | undefined;
  const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const resolvedApiBaseUrl =
    apiProxyTarget ||
    (apiBaseUrl && apiBaseUrl.startsWith('http') ? apiBaseUrl : undefined) ||
    'http://127.0.0.1:8000';
  const backendBaseUrl = resolvedApiBaseUrl.replace(/\/$/, '');
  const googleAuthUrl = `${backendBaseUrl}/auth/google/redirect`;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-advance removed - carousel is now frozen
  useEffect(() => {
    const timer = setInterval(nextSlide, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('oauth_error');

    if (!error) return;

    setOauthError(error);
    params.delete('oauth_error');
    params.delete('auth');

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', nextUrl);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 transition-colors duration-300">
      <div
        className={`flex h-[min(90vh,620px)] w-full max-w-[1000px] overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(15,23,42,0.25)] md:flex-row ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        {/* Left Side: Carousel & Branding */}
        <div className="relative hidden overflow-hidden md:flex md:w-1/2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div className="relative w-full h-full">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&q=80&w=2000";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-between p-8 lg:p-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      <img 
                        src="/logos/logoBookingTrip.png"
                        alt="Komrong Logo" 
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%230052CC'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='40' font-weight='bold'%3EK%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <span className="text-white font-bold text-xl">Komrong</span>
                  </div>

                  <div className="max-w-[300px]">
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-5 text-[32px] font-bold leading-[1.03] text-white"
                    >
                      {slides[currentSlide].title}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg leading-relaxed text-white/95"
                    >
                      {slides[currentSlide].subtitle}
                    </motion.p>
                  </div>
                  
                  {/* Carousel Controls */}
                  <div className="flex justify-center">
                    <div className="flex gap-2">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            currentSlide === index 
                              ? 'bg-white w-6' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Form */}
        <div className={`flex w-full flex-col overflow-y-auto p-4 md:w-1/2 md:p-6 relative ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          <button
            onClick={onClose}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
          </button>
          
          <div className="mb-4 flex flex-col items-center mt-2">
            <h2 className={`mb-1 text-2xl font-bold leading-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>{title}</h2>
            <p className={`text-center text-sm ${
              isDarkMode ? 'text-slate-300' : 'text-slate-500'
            }`}>{subtitle}</p>
          </div>

          {/* Tab Switcher */}
          <div className={`relative mb-3 grid grid-cols-2 rounded-xl border p-1 ${
            isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-slate-100'
          }`}>
          
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 1.1 }}
              className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-lg bg-primary shadow-[0_8px_16px_rgba(0,82,204,0.3)] ${
                activeTab === 'login' ? 'left-1' : 'left-[calc(50%+0rem)]'
              }`}
            />
            <motion.button
              onClick={() => onTabChange('login')}
              whileHover={{ scale: activeTab === 'login' ? 1 : 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 250, damping: 24 }}
              className={`relative z-10 rounded-lg py-1.5 text-sm font-semibold transition-colors ${
                activeTab === 'login'
                  ? 'text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <motion.span
                key={activeTab === 'login' ? 'login-active' : 'login-inactive'}
                initial={{ opacity: 0.75, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, ease: 'easeOut' }}
                className="inline-block"
              >
                Login
              </motion.span>
            </motion.button>
            <motion.button
              onClick={() => onTabChange('register')}
              whileHover={{ scale: activeTab === 'register' ? 1 : 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 250, damping: 24 }}
              className={`relative z-10 rounded-lg py-1.5 text-sm font-semibold transition-colors ${
                activeTab === 'register'
                  ? 'text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <motion.span
                key={activeTab === 'register' ? 'register-active' : 'register-inactive'}
                initial={{ opacity: 0.75, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, ease: 'easeOut' }}
                className="inline-block"
              >
                Register
              </motion.span>
            </motion.button>
          </div>

          <div className="flex-1">
            {oauthError && (
              <div className={`mx-auto mb-4 max-w-sm rounded-lg border px-3 py-2 text-sm ${
                isDarkMode
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                  : 'border-amber-300 bg-amber-50 text-amber-800'
              }`}>
                {oauthError}
              </div>
            )}
            {children}
          </div>

          {/* Social Login */}
          <div className="mt-4">
            <div className="relative mb-4 flex items-center justify-center">
              <div className={`absolute inset-0 flex items-center ${
                isDarkMode ? 'border-slate-600' : 'border-slate-200'
              }`}>
                <div className="w-full border-t"></div>
              </div>
              <span className={`relative px-3 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-400'
              }`}>
                SOCIAL LOGIN
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={googleAuthUrl}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all hover:bg-opacity-10 ${
                isDarkMode 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                <span>Google</span>
              </a>
              <button
                type="button"
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all hover:bg-opacity-10 ${
                isDarkMode 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              >
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-4 h-4" />
                <span>Facebook</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className={`text-xs leading-relaxed ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              By continuing, you agree to our{' '}
              <a href="#" className="font-semibold text-primary hover:underline">Terms of Service</a>
              {' and '}
              <a href="#" className="font-semibold text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
