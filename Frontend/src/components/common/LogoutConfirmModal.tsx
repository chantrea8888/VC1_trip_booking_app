import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const { isDarkMode } = useTheme();
  const modalNode = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-slate-950/50 backdrop-blur-sm grid place-items-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.18 }}
            onClick={(event) => event.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDarkMode 
                ? 'border-slate-700 bg-slate-900 text-slate-100' 
                : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className={`border border-dashed rounded-xl p-5 ${
              isDarkMode ? 'border-slate-600' : 'border-slate-300'
            }`}>
              <h3 className={`text-lg font-bold text-center ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>Logout</h3>
              <p className={`mt-4 text-sm leading-relaxed text-center ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Are you sure you want to log out from Komrong Trip Booking?
              </p>
              <div className="mt-5 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className={`h-10 min-w-[110px] px-4 rounded-lg border transition-colors font-medium ${
                    isDarkMode
                      ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="h-10 min-w-[110px] px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalNode, document.body);
};
