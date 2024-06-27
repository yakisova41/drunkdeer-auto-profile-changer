import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { ProfileSelector } from './ProfileSelector';
import { CreateProfile } from './CreateProfile';
import { useProfile } from '../../../store/profile';
import { defaultKeySettings } from '../../../store/profile/defaultKeySettings';
import { useHiD } from '../../../store/hid';
import { ExeList } from './ExeList';
import { SettingItem } from '../../../components/SettingItem';

export function ProfileSetting() {
  const [isCreatePopupVisible, setCreatePopupVisible] = useState(false);
  const profile = useProfile();
  const hid = useHiD();

  const currentDevice =
    hid.currentDevicePath !== null ? hid.getDevice(hid.currentDevicePath) : null;

  const currentProfileId =
    currentDevice === null ? null : profile.currentProfileIds[currentDevice.path].current;

  const handleCreateProfile = (profileName: string) => {
    if (currentDevice !== null) {
      const clone = structuredClone(defaultKeySettings);
      const id = profile.pushProfile(
        {
          keySettings: clone,
          name: profileName,
          exeFilePaths: [],
          devicePath: currentDevice.path,
        },
        currentDevice.path,
      );
      profile.setCurrentProfileId(id, currentDevice.path);
    }
    setCreatePopupVisible(false);
  };

  const handleOpenCreateProfile = () => {
    setCreatePopupVisible(true);
  };

  const handleRemoveProfile = () => {
    if (currentProfileId !== null && currentProfileId !== 'default' && currentDevice !== null) {
      profile.removeProfile(currentProfileId, currentDevice.path);
      profile.setCurrentProfileId('default', currentDevice.path);
    }
  };

  return (
    <Box sx={{ width: '40%' }}>
      <Typography variant="h6" component="h1">
        Profile Setting
      </Typography>

      <Box sx={{ p: 2 }}>
        <SettingItem>
          <Typography variant="body1" component="span">
            Select profile:
          </Typography>
          <ProfileSelector />
        </SettingItem>

        <SettingItem>
          <Button variant="contained" onClick={handleOpenCreateProfile}>
            Create new profile
          </Button>
          <Button color="error" onClick={handleRemoveProfile}>
            Remove Profile
          </Button>
        </SettingItem>

        <ExeList />
      </Box>

      {isCreatePopupVisible && (
        <CreateProfile
          onCreate={handleCreateProfile}
          onClose={() => {
            setCreatePopupVisible(false);
          }}
        />
      )}
    </Box>
  );
}
