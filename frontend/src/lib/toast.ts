import { useUIStore, type ToastType } from '@/stores/uiStore';

function show(type: ToastType, message: string): void {
  useUIStore.getState().addToast({ type, message });
}

export const toast = {
  success: (message: string) => show('success', message),
  error: (message: string) => show('error', message),
  info: (message: string) => show('info', message),
  warning: (message: string) => show('warning', message),
};
