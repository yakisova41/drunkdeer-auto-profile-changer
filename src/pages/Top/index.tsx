import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { useHiD } from '../../store/hid';
import { HidDevice } from '../../api/hid';
import { useNavigate } from 'react-router-dom';

const assetMap: Record<number, string> = {
  9091: '/devices/A75.png',
};

export function Top() {
  const hid = useHiD();

  return (
    <Box
      sx={{
        width: '100%',
        mt: 5,
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h3" component="h3">
          Select Device
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '0 20px',
          mt: 5,
          flexWrap: 'wrap',
        }}
      >
        {hid.devices.map((device, i) => {
          return <Device key={i} device={device} />;
        })}
      </Box>
    </Box>
  );
}

function Device({ device }: { device: HidDevice }) {
  const hid = useHiD();
  const nav = useNavigate();

  const handleSelect = () => {
    hid.setCurrentDevicePath(device.path);
    nav('/performance');
  };

  return (
    <Card>
      <CardContent>
        <img src={assetMap[device.product_id]} width={180} />
        <Typography variant="h4" fontWeight="bold" component="div">
          {device.product_name}
        </Typography>
        <Typography variant="body2" component="span">
          product_id: {device.product_id}
        </Typography>
      </CardContent>
      <CardActions>
        <Button onClick={handleSelect}>Select Device</Button>
      </CardActions>
    </Card>
  );
}
