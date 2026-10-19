/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 3200,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#356B52] flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-[#B99A5B] flex-shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-[#85263E] flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#FFFFFF] border border-[#DDD8CF] shadow-lg rounded-md p-3.5 flex items-center justify-between gap-3 animate-fade-in transition-all">
      <div className="flex items-center gap-2.5">
        {icons[type]}
        <p className="text-xs font-medium text-[#1C1C1C] leading-snug">{message}</p>
      </div>
      <button
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="text-[#777777] hover:text-[#1C1C1C] p-1 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
