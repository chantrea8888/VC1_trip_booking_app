import React from 'react';
import { motion } from 'motion/react';

const VisitorHome = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/40 z-10" />
        {/* Ensure you place a hero.jpg in public/visithome/ */}
        <img 
          src="/visithome/hero.jpg" 
          alt="Visit Home Hero" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image is missing
            e.currentTarget.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1920';
          }}
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg"
          >
            Welcome Home
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-2xl drop-shadow-md"
          >
            Your journey to the most comfortable and scenic destinations starts here.
          </motion.p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Visit With Us?</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We curate the best experiences, ensuring every trip feels like coming home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Curated Locations', desc: 'Hand-picked destinations for maximum comfort.' },
            { title: 'Seamless Booking', desc: 'Book your entire trip in just a few clicks.' },
            { title: '24/7 Support', desc: 'We are always here to help you on your journey.' },
          ].map((item, index) => (
            <div key={index} className="p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitorHome;