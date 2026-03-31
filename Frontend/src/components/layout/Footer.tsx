import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { SupportModal } from '../common/SupportModal';
import { BrandLogo } from '../common/BrandLogo';

interface FooterProps {
  onLoginClick: () => void;
  onHomeClick: () => void;
  onTripPlannerClick: () => void;
  onBookingsClick: () => void;
  onHotelsClick: () => void;
  onRentalsClick: () => void;
  onActivitiesClick: () => void;
  onTourGuidesClick: () => void;
  user: { name: string } | null;
}

export const Footer: React.FC<FooterProps> = ({
  onLoginClick,
  onHomeClick,
  onTripPlannerClick,
  onBookingsClick,
  onHotelsClick,
  onRentalsClick,
  onActivitiesClick,
  onTourGuidesClick,
  user
}) => {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportContentType, setSupportContentType] = useState<'help-center' | 'terms' | 'privacy' | 'refund'>('help-center');

  const handleSupportClick = (type: 'help-center' | 'terms' | 'privacy' | 'refund') => {
    setSupportContentType(type);
    setIsSupportModalOpen(true);
  };

  const closeSupportModal = () => {
    setIsSupportModalOpen(false);
  };
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BrandLogo variant="mark" className="w-10 h-10 rounded-lg overflow-hidden" />
              <BrandLogo variant="full" className="h-14 w-[220px] max-w-[55vw]" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Discover the hidden gems of Komrong. The all-in-one booking platform for your tropical getaway.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Services</h4>
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={onHotelsClick}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                >
                  Hotels & Villas
                </button>
              </li>
              <li>
                <button 
                  onClick={onRentalsClick}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                >
                  Transport Booking
                </button>
              </li>
              <li>
                <button 
                  onClick={onActivitiesClick}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                >
                  Local Activities
                </button>
              </li>
              <li>
                <button 
                  onClick={onTourGuidesClick}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                >
                  Tour Guides
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Support</h4>
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={() => handleSupportClick('help-center')}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSupportClick('terms')}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSupportClick('privacy')}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSupportClick('refund')}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                >
                  Refund Policy
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Newsletter</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Get travel tips and exclusive deals in your inbox.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email" 
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2024 Komrong. All rights reserved. Made for adventure.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-white p-0.5 border border-slate-100 dark:border-slate-800">
                <img 
                  src="https://files.oaiusercontent.com/file-Xf6YF7K3G9H2J5L8M1N4P7Q0" 
                  alt="Komrong Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Komrong</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={onHomeClick}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Home
              </button>
              <button
                onClick={onTripPlannerClick}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Plan Trip
              </button>
              <button
                onClick={onBookingsClick}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                My Booking
              </button>
              {user ? (
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Hello, {user.name}</span>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                >
                  Login/Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={closeSupportModal}
        contentType={supportContentType}
      />
    </footer>
  );
};
