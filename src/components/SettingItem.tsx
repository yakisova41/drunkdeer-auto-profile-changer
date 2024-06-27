import Box from '@mui/material/Box';
import { ReactNode } from 'react';

export function SettingItem({ children }: { children: ReactNode }) {
  return <Box sx={{ display: 'flex', gap: '0 10px', alignItems: 'center', mt: 2 }}>{children}</Box>;
}
