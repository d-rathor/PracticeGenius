import React, { Fragment } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  size = 'md',
}) => {
  const [isClosing, setIsClosing] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity',
        isClosing ? 'opacity-0' : 'opacity-100'
      )}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-white rounded-lg shadow-xl transform transition-all',
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100',
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className, onClose }) => {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-100 flex items-center justify-between', className)}>
      <div className="font-semibold text-lg">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-100 flex justify-end space-x-2', className)}>
      {children}
    </div>
  );
};

export { Modal, ModalHeader, ModalBody, ModalFooter };
