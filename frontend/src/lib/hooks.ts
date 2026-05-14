import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const confirm = (options: {
    title: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        danger: options.danger,
        onConfirm: () => {
          setState((s) => ({ ...s, open: false }));
          resolve(true);
        },
      });
    });
  };

  const cancel = () => {
    setState((s) => ({ ...s, open: false }));
  };

  return { ...state, confirm, cancel };
}
