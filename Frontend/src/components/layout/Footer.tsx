import React from 'react';
import { Send } from 'lucide-react';

interface FooterProps {
  onLoginClick: () => void;
  user: { name: string } | null;
}

export const Footer: React.FC<FooterProps> = ({ onLoginClick, user }) => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white p-0.5 border border-slate-100 dark:border-slate-800">
                <img 
                  src="https://files.oaiusercontent.com/file-Xf6YF7K3G9H2J5L8M1N4P7Q0" 
                  alt="Komrong Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Komrong Explorer</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Discover the hidden gems of Komrong. The all-in-one booking platform for your tropical getaway.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Services</h4>
            <ul className="space-y-4">
              {["Hotels & Villas", "Transport Booking", "Local Activities", "Tour Guides"].map((item, i) => (
                <li key={i}><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Support</h4>
            <ul className="space-y-4">
              {["Help Center", "Terms of Service", "Privacy Policy", "Refund Policy"].map((item, i) => (
                <li key={i}><a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{item}</a></li>
              ))}
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
            © 2024 Komrong Explorer. All rights reserved. Made for adventure.
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
              <span className="text-sm font-bold text-slate-900 dark:text-white">Komrong Explorer</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-xs font-medium text-slate-600 dark:text-slate-400">Home</a>
              <a href="#" className="text-xs font-medium text-slate-600 dark:text-slate-400">Plan Trip</a>
              <a href="#" className="text-xs font-medium text-slate-600 dark:text-slate-400">My Booking</a>
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
    </footer>
  );
};
