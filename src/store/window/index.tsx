import { create } from 'zustand';

export const useWindow = create<WindowStore>((set) => ({
  moduleName: '',
  selfExecutableFilePath: '',
  setModuleName: (name: string) => set(() => ({ moduleName: name })),
  setSelfExecutableFilePath: (path: string) => set(() => ({ selfExecutableFilePath: path })),
}));

export interface WindowStore {
  moduleName: string;
  selfExecutableFilePath: string;
  setModuleName: (name: string) => void;
  setSelfExecutableFilePath: (path: string) => void;
}
