import { create } from 'zustand';

export const useMessage = create<MessageStore>((set) => {
  const store: MessageStore = {
    isOpen: false,
    message: '',
    setOpen: (isOpen) => {
      set({ isOpen });
    },
    setMessage: (message) => {
      set({ message });
    },
  };

  return store;
});

export interface MessageStore {
  isOpen: boolean;
  message: string;
  setOpen: (isOpen: boolean) => void;
  setMessage: (message: string) => void;
}

export function messageOpenUntilMs(message: string, ms: number, store: MessageStore) {
  store.setOpen(true);
  store.setMessage(message);
  setTimeout(() => {
    store.setOpen(false);
  }, ms);
}
