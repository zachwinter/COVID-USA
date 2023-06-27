import { acceptHMRUpdate, defineStore } from 'pinia';

export type ToastType = 'message' | 'error' | null;

export const useToast = defineStore('toast', () => {
  const type: Ref<'message' | 'error' | 'prompt'> = ref('message');
  const text: Ref<string> = ref('');
  const visible: Ref<boolean> = ref(false);
  const sticky: Ref<boolean> = ref(false);
  const duration: Ref<number> = ref(3500);
  const timeout: any = ref(null);

  const show = async (message: string) => {
    text.value = message;
    visible.value = true;
    if (sticky.value) return;
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
      visible.value = false;
    }, duration.value);
  };

  const message = (message: string) => {
    type.value = 'message';
    show(message);
  };

  const error = (message: string) => {
    type.value = 'error';
    show(message);
  };

  const prompt = (message: string) => {
    type.value = 'prompt';
    show(message);
  };

  return {
    text,
    type,
    visible,
    message,
    error,
    prompt,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useToast, import.meta.hot));
