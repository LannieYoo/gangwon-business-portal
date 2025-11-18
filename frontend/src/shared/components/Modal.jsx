/**
 * Modal Component
 */

import { useEffect } from 'react';
import { cn } from '@shared/utils/helpers';
import './Modal.css';

export function Modal({ 
  isOpen, 
  onClose, 
  title,
  children, 
  size = 'md',
  showCloseButton = true,
  className 
}) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  
  return (
    <div className="modal-container">
      <div className="modal-wrapper">
        {/* Background overlay */}
        <div 
          className="modal-overlay"
          onClick={onClose}
        />
        
        {/* Center modal */}
        <span className="modal-spacer">&#8203;</span>
        
        {/* Modal content */}
        <div className={cn(
          'modal-content',
          `modal-${size}`,
          className
        )}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="modal-header">
              {title && (
                <h3 className="modal-title">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={onClose}
                >
                  <svg className="modal-close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalFooter({ children, className }) {
  return (
    <div className={cn('modal-footer', className)}>
      {children}
    </div>
  );
}

