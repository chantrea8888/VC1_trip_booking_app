import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface RecommendationModalProps {
  item: any;
  onClose: () => void;
}

export const RecommendationModal: React.FC<RecommendationModalProps> = ({ item, onClose }) => {
  const highlights = Array.isArray(item?.highlights) ? item.highlights : [];
  const title = item?.title || item?.name || 'Travel Recommendation';
  const location = item?.location || 'Cambodia';
  const description = item?.description || 'Discover this curated recommendation for your upcoming trip.';
  const price = item?.price || 'Contact us';

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
            src={item.image} 
            alt={title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {item.badge && (
            <span className="absolute bottom-6 left-6 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
              {item.badge}
            </span>
          )}
        </div>

        <div className="p-8 md:p-10 flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{location}</span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
            {description}
          </p>

          {highlights.length > 0 && (
            <div className="space-y-3 mb-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highlights</h4>
              <div className="flex flex-wrap gap-2">
                {highlights.map((h: string, i: number) => (
                  <span key={i} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Price</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{price}</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95">
              Book Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
