<<<<<<< HEAD
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
    title: "Your Adventure Awaits",
    subtitle: "Discover amazing destinations with Komrong Travel.",
    image: "https://images.unsplash.com/photo-1507525428034-b723a9ce6890?auto=format&fit=crop&q=80&w=2000"
  },
  {
    id: 2,
    title: "Paradise Islands",
    subtitle: "Experience pristine beaches and crystal waters.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2000"
  },
  {
    id: 3,
    title: "Ancient Wonders",
    subtitle: "Explore historic civilizations and cultural heritage.",
    image: "https://images.unsplash.com/photo-1569660072562-47a003366792?auto=format&fit=crop&q=80&w=2000"
  }
];
=======
import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
>>>>>>> chantrea/feature-customer

interface AuthLayoutProps {
  children: React.ReactNode;
  onBack: () => void;
<<<<<<< HEAD
  onClose?: () => void;
=======
>>>>>>> chantrea/feature-customer
  title: string;
  subtitle: string;
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
<<<<<<< HEAD
=======
  onBack,
>>>>>>> chantrea/feature-customer
  title,
  subtitle,
  activeTab,
  onTabChange,
<<<<<<< HEAD
  onClose = () => {}, // Default empty function
}) => {
  const { isDarkMode } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
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
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-between p-8 lg:p-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      <img 
                        src="/logos/logoBookingTrip.png"
                        alt="Logo" 
                        className="w-full h-full object-cover"
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
        <div className={`flex w-full flex-col overflow-y-auto p-7 md:w-1/2 md:p-10 relative ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
          </button>
          
          <div className="mb-8 flex flex-col items-center mt-4">
            <h2 className={`mb-2 text-[32px] font-bold leading-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>{title}</h2>
            <p className={`text-center text-base ${
              isDarkMode ? 'text-slate-300' : 'text-slate-500'
            }`}>{subtitle}</p>
          </div>

          {/* Tab Switcher */}
          <div className={`relative mb-4 grid grid-cols-2 rounded-xl border p-1 ${
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
              className={`relative z-10 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
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
              className={`relative z-10 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
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
=======
}) => {
  return (
    <div className="min-h-screen bg-slate-100/50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]"
      >
        {/* Left Side: Image & Branding */}
        <div className="hidden md:flex md:w-1/2 relative bg-emerald-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1569660072562-47a003366792?auto=format&fit=crop&q=80&w=2000"
            alt="Angkor Wat with Vibrant Green Field"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="relative z-10 p-12 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1569660072562-47a003360691?auto=format&fit=crop&q=80&w=200" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Komrong Explorer</span>
            </div>

            <div className="max-w-md">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-bold text-white leading-tight mb-6"
              >
                Your next adventure begins here.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-lg leading-relaxed"
              >
                Explore the hidden gems of the world with the most trusted travel partner.
              </motion.p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col relative">
          <button 
            onClick={onBack}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center">{subtitle}</p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex mb-8">
            <button
              onClick={() => onTabChange('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => onTabChange('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Register
            </button>
>>>>>>> chantrea/feature-customer
          </div>

          <div className="flex-1">
            {children}
          </div>

          {/* Social Login */}
<<<<<<< HEAD
          <div className="mt-6">
            <div className="relative mb-6 flex items-center justify-center">
              <div className={`absolute inset-0 flex items-center ${
                isDarkMode ? 'border-slate-600' : 'border-slate-200'
              }`}>
                <div className="w-full border-t"></div>
              </div>
              <span className={`relative px-4 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-400'
              }`}>
                SOCIAL LOGIN
=======
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <span className="relative px-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-400 uppercase tracking-widest">
                {activeTab === 'login' ? 'Social Login' : 'or register with'}
>>>>>>> chantrea/feature-customer
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
<<<<<<< HEAD
              <button className={`flex items-center justify-center gap-3 rounded-xl border px-4 py-3 font-semibold transition-all hover:bg-opacity-10 ${
                isDarkMode 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span>Google</span>
              </button>
              <button className={`flex items-center justify-center gap-3 rounded-xl border px-4 py-3 font-semibold transition-all hover:bg-opacity-10 ${
                isDarkMode 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}>
=======
              <button className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold text-slate-700 dark:text-slate-200">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold text-slate-700 dark:text-slate-200">
>>>>>>> chantrea/feature-customer
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                <span>Facebook</span>
              </button>
            </div>
          </div>

<<<<<<< HEAD
          <div className="mt-6 text-center">
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
=======
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeTab === 'login' ? 'By continuing, you agree to our ' : 'By registering, you agree to our '}
              <a href="#" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Terms of Service</a>
              {' and '}
              <a href="#" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </motion.div>
>>>>>>> chantrea/feature-customer
    </div>
  );
};
