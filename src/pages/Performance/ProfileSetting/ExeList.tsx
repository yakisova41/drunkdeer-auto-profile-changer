import { SettingItem } from '../../../components/SettingItem';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { open } from '@tauri-apps/api/dialog';
import { Profile, useProfile } from '../../../store/profile';
import CloseIcon from '@mui/icons-material/Close';
import { useHiD } from '../../../store/hid';
import { useEffect, useState } from 'react';

export function ExeList() {
  const profile = useProfile();
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
  }, [currentProfileId, currentDevice, profile.profiles]);

  const handleSelectProcess = () => {
    if (currentProfileId !== null && currentDevice !== null && currentProfile !== null) {
      openFileSelector().then((exeFilePath) => {
        const clone = structuredClone(currentProfile);
        clone.exeFilePaths = [...clone.exeFilePaths, exeFilePath];
        profile.updateProfile(currentProfileId, currentDevice.path, clone);
        return;
      });
    }
  };

  const handleRemove = (exeFilePath: string) => {
    if (currentProfileId !== null && currentDevice !== null) {
      const current = profile.profiles[currentDevice.path][currentProfileId];
      const clone = structuredClone(current);

      const index = current.exeFilePaths.indexOf(exeFilePath);
      clone.exeFilePaths.splice(index, 1);
      profile.updateProfile(currentProfileId, currentDevice.path, clone);
    }
  };

  return (
    <>
      {currentProfileId !== null && currentProfile !== null && (
        <>
          <SettingItem>
            <Typography variant="body1" component="span">
              Add match program:
            </Typography>
            <Button variant="contained" onClick={handleSelectProcess}>
              Select EXE file
            </Button>
          </SettingItem>
          <List
            sx={{
              width: '100%',
              maxWidth: 360,
              bgcolor: 'background.paper',
              position: 'relative',
              overflowX: 'hidden',
              overflowY: 'scroll',
              maxHeight: 300,
              '& ul': { padding: 0 },
            }}
          >
            {currentProfile.exeFilePaths.map((exeFilePath, i) => {
              return (
                <ListItem
                  key={i}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="comments"
                      onClick={() => {
                        handleRemove(exeFilePath);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton role={undefined} dense>
                    <ListItemText primary={exeFilePath} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </>
      )}
    </>
  );
}

function openFileSelector(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Program file',
          extensions: ['exe'],
        },
      ],
    });
    if (typeof selected === 'string') {
      resolve(selected);
    } else {
      reject('');
    }
  });
}
