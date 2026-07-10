'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';

const BackButton = ({ 
  href, 
  label = 'Back', 
  showHomeButton = false, 
  className = '',
  variant = 'default' 
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    router.push('/');
  };

  if (variant === 'minimal') {
    return (
      <motion.button
        onClick={handleBack}
        className={`flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white dark:text-slate-300 dark:hover:text-white transition-colors ${className}`}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span className="text-sm">{label}</span>
      </motion.button>
    );
  }

  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <motion.button
        onClick={handleBack}
        className="flex items-center px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-lg transition-colors"
        whileHover={{ x: -2, backgroundColor: '#f8fafc' }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="font-medium">{label}</span>
      </motion.button>

      {showHomeButton && (
        <motion.button
          onClick={handleHome}
          className="flex items-center px-3 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors"
          whileHover={{ backgroundColor: '#f0fdf4' }}
          whileTap={{ scale: 0.95 }}
        >
          <Home className="w-4 h-4 mr-2" />
          <span className="font-medium">Home</span>
        </motion.button>
      )}
    </div>
  );
};

export default BackButton;