import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useHiD } from '../../store/hid';
import { useEffect, useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import { Keybord } from './Keybord';
import { keyMapings } from './KeyMapings';
import { Profile, useProfile } from '../../store/profile';
import { ProfileSetting } from './ProfileSetting';
import { KeySettings } from './KeySettings';

export function Performance() {
  const hid = useHiD();
  // const _nav = useNavigate();
  const profile = useProfile();

  const [selectingKeys, setSelectingKeys] = useState<string[]>([]);

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

  const handleKeyClick = (keyName: string) => {
    setSelectingKeys([keyName]);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1">
        Performance
      </Typography>
      {currentDevice !== null && currentProfile !== null && (
        <>
          <Typography variant="body1" component="span">
            Connected to "{currentDevice.product_name}" now.
          </Typography>

          {currentProfile !== null && (
            <Keybord
              keyMaping={keyMapings[currentDevice.product_id]}
              profile={currentProfile}
              onClick={handleKeyClick}
              selectingKeys={selectingKeys}
            />
          )}

          <Box sx={{ display: 'flex', gap: '0 20px', mt: 2 }}>
            <ProfileSetting />
            <KeySettings selectedKeys={selectingKeys} />
          </Box>
        </>
      )}
    </Box>
  );
}
