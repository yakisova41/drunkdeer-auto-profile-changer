import { create } from 'zustand';
import { HidDevice } from '../../api/hid';

export const useHiD = create<HiDState>((set) => ({
  length: 0,
  currentDevicePath: null,
  setCurrentDevicePath: (devicePath: string) => {
    set(() => ({ currentDevicePath: devicePath }));
  },
  devices: [],
  addDevice: (d: HidDevice) => {
    set((state) => ({ devices: [...state.devices, d], length: state.length + 1 }));
  },
  getDevice: (requestPath: string) => {
    let returnDevice = null;
    set((state) => {
      state.devices.forEach((device) => {
        if (device.path === requestPath) {
          returnDevice = device;
        }
      });
      return state;
    });
    return returnDevice;
  },
}));

export interface HiDState {
  length: number;
  currentDevicePath: null | string;
  setCurrentDevicePath: (devicePath: string) => void;
  devices: HidDevice[];
  addDevice: (d: HidDevice) => void;
  getDevice: (path: string) => HidDevice | null;
}
