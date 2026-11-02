import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook kustom untuk manajemen toast notification dengan cleanup otomatis
 * Mengembalikan [toastMessage, showToast] mirip useState tapi dengan auto-dismiss
 */
export function useToast(defaultDuration = 3000) {
  const [toastMessage, setToastMessage] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((msg, duration = defaultDuration) => {
    setToastMessage(msg);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setToastMessage(null), duration);
  }, [defaultDuration]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return [toastMessage, showToast];
}

/**
 * Hook untuk menyalin teks ke clipboard dengan feedback visual
 * Mengembalikan [copyText, handleCopy]
 * @param {string} defaultText - Teks default untuk tombol copy
 * @param {number} feedbackDuration - Durasi feedback "Tersalin!" dalam ms
 */
export function useCopyFeedback(defaultText = 'Salin', feedbackDuration = 1800) {
  const [copyText, setCopyText] = useState(defaultText);
  const timerRef = useRef(null);

  const handleCopy = useCallback(async (textToCopy) => {
    try {
      // Check for HTTPS requirement for clipboard API
      if (!navigator.clipboard || (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost')) {
        // Fallback untuk non-HTTPS: gunakan execCommand (deprecated tapi masih jalan)
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } else {
        await navigator.clipboard.writeText(textToCopy);
      }
      setCopyText('Tersalin!');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopyText(defaultText), feedbackDuration);
    } catch (err) {
      console.error('Gagal menyalin:', err);
      setCopyText('Gagal');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopyText(defaultText), feedbackDuration);
    }
  }, [defaultText, feedbackDuration]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return [copyText, handleCopy];
}

/**
 * Hook untuk menangani keyboard shortcuts umum
 * @param {Object} options - Konfigurasi shortcut
 * @param {Function} options.onFind - Handler untuk Cmd/Ctrl+F
 * @param {Function} options.onEscape - Handler untuk Escape key
 * @param {HTMLElement} options.findInputRef - Ref ke input pencarian untuk focus
 */
export function useKeyboardShortcuts({ onFind, onEscape, findInputRef }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + F untuk fokus pencarian
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        if (onFind) {
          e.preventDefault();
          e.stopPropagation();
          onFind();
        } else if (findInputRef?.current) {
          e.preventDefault();
          e.stopPropagation();
          findInputRef.current.focus();
        }
      }
      // Escape untuk menutup modal
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFind, onEscape, findInputRef]);
}