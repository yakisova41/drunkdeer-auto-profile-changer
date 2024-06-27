import { Box, Button, Slider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Profile, getKeySettingValueByKeyName, useProfile } from '../../../store/profile';
import { SettingItem } from '../../../components/SettingItem';
import { useHiD } from '../../../store/hid';

export function KeySettings({ selectedKeys }: { selectedKeys: string[] }) {
  const profile = useProfile();
  const [isReady, setReady] = useState(false);
  const [ac, setAc] = useState(0.2);
  const [down, setDown] = useState(0.1);
  const [up, setUp] = useState(0.1);

  const hid = useHiD();
  const currentDevice =
    hid.currentDevicePath !== null ? hid.getDevice(hid.currentDevicePath) : null;

  const currentProfileId =
    currentDevice === null ? null : profile.currentProfileIds[currentDevice.path].current;

  const [currentProfile, setCurrentProfile] = useState<null | Profile>(null);

  useEffect(() => {
    if (currentDevice !== null && currentProfileId !== null) {
      setCurrentProfile(profile.profiles[currentDevice.path][currentProfileId]);
    }
  }, [currentProfileId, currentDevice]);

  const handleAcChange = (_e: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      setAc(value);
    }
  };

  const handleDownChange = (_e: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      setDown(value);
    }
  };

  const handleUpChange = (_e: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      setUp(value);
    }
  };

  useEffect(() => {
    setReady(false);
    if (selectedKeys[0] !== undefined && currentProfile !== null) {
      setTimeout(() => {
        const { downstroke, upstroke, action_point } = getKeySettingValueByKeyName(
          selectedKeys[0],
          currentProfile.keySettings,
        );
        setAc(action_point);
        setDown(downstroke);
        setUp(upstroke);
        setReady(true);
      });
    }
  }, [selectedKeys]);

  const handleSave = () => {
    if (currentProfile !== null && currentProfileId !== null && currentDevice !== null) {
      currentProfile.keySettings.forEach((settingValue, index) => {
        if (selectedKeys.includes(settingValue.keyname)) {
          currentProfile.keySettings[index].action_point = ac;
          currentProfile.keySettings[index].downstroke = down;
          currentProfile.keySettings[index].upstroke = up;
        }
      });

      profile.updateProfile(currentProfileId, currentDevice.path, currentProfile);
    }
  };

  return (
    isReady && (
      <Box sx={{ width: '40%' }}>
        <Typography variant="h6" component="h1">
          Key Setting
        </Typography>

        <Box sx={{ p: 2 }}>
          <SettingItem>
            <Typography variant="body1" component="span">
              Action Point
            </Typography>
            <Slider
              onChange={handleAcChange}
              value={ac}
              min={0.2}
              max={3.8}
              step={0.1}
              className="range"
            ></Slider>
            {ac}
          </SettingItem>

          <SettingItem>
            <Typography variant="body1" component="span">
              Downstroke
            </Typography>
            <Slider
              onChange={handleDownChange}
              value={down}
              min={0.1}
              max={3.6}
              step={0.1}
              className="range"
            ></Slider>
            {down}
          </SettingItem>

          <SettingItem>
            <Typography variant="body1" component="span">
              Upstroke
            </Typography>
            <Slider
              onChange={handleUpChange}
              value={up}
              min={0.1}
              max={3.6}
              step={0.1}
              className="range"
            ></Slider>
            {up}
          </SettingItem>

          <SettingItem>
            <Button variant="contained" onClick={handleSave}>
              SAVE
            </Button>
          </SettingItem>
        </Box>
      </Box>
    )
  );
}
