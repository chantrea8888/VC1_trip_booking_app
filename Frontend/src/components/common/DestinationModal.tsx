import React from 'react';
import { motion } from 'motion/react';
import { X, MapPin } from 'lucide-react';

interface DestinationModalProps {
  dest: any;
  onClose: () => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({ dest, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/80 dark:bg-slate-700/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-full md:w-1/2 h-64 md:h-auto relative">
          <img 
            src={dest.image} 
            alt={dest.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-6 left-6">
            <h3 className="text-3xl font-bold text-white drop-shadow-lg">{dest.name}</h3>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{dest.count}</p>
          </div>
        </div>

        <div className="p-8 md:p-10 flex-1">
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">About Destination</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {dest.description}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Must-Visit Spots</h4>
            <div className="flex flex-wrap gap-2">
              {dest.popularSpots.map((spot: string, i: number) => (
                <span key={i} className="flex items-center gap-1.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {spot}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">12k+ visited</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95">
              Explore Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
