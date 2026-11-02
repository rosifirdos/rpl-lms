import { useState, useCallback, useEffect } from 'react';

/**
 * useToast - Shared toast notification hook
 * Returns [toastMessage, showToast] where showToast accepts a message string
 * and an optional duration (default 3500ms)
 */
export function useToast() {
  const [toastMessage, setToastMessage] = useState(null);
  const timeoutRef = useState(null);

  const showToast = useCallback((message, duration = 3500) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToastMessage(message);
    timeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      timeoutRef.current = null;
    }, duration);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [toastMessage, showToast];
}

/**
 * useKeyboardShortcuts - Shared keyboard shortcuts hook
 * Supports Cmd/Ctrl+F for search focus and Escape for closing modals
 */
export function useKeyboardShortcuts({ findInputRef, onEscape, onFind }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key - close modals
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      // Cmd/Ctrl + F - focus search input
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        if (findInputRef?.current) {
          findInputRef.current.focus();
        }
        onFind?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [findInputRef, onEscape, onFind]);
}

/**
 * useCopyFeedback - Shared copy-to-clipboard hook with toast feedback
 */
export function useCopyFeedback(showToast) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = useCallback(async (text, id, customMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast?.(customMessage || 'Tersalin ke clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      showToast?.('Gagal menyalin: ' + err.message);
    }
  }, [showToast]);

  return { copiedId, handleCopy };
}