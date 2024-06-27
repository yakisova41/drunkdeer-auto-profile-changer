import { invoke } from '@tauri-apps/api';

export function getHidDevices(): Promise<HidDevice[]> {
  return invoke<HidDevice[]>('get_hid_devices');
}

export function sendPacketHid(
  path: string,
  packets: number[][],
  reportId: number,
): Promise<number> {
  return invoke('send_packet_to_hid', { path, packets, reportId });
}

export interface HidDevice {
  product_id: number;
  serial_number: string;
  product_name: string;
  release_number: number;
  bus_type: number;
  interface_number: number;
  path: string;
}
