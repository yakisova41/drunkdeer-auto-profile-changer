import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Box from '@mui/material/Box';
import { Top } from './pages/Top';
import { Performance } from './pages/Performance';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import Encoding from 'encoding-japanese';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { useWindow } from './store/window';
import { resolve } from '@tauri-apps/api/path';
import { exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { ProfileStore, useProfile } from './store/profile';
import { useMessage } from './store/message/message';
import { Snackbar } from '@mui/material';
import { getHidDevices } from './api/hid';
import { useHiD } from './store/hid';
import RouterInner from './RouterInner';
import { defaultKeySettings } from './store/profile/defaultKeySettings';
import { sendProfile } from './api/profile';

/**
 * Save profile to storage.
 * @param profiles
 */
async function saveStorage(
  profiles: ProfileStore['profiles'],
  currents: ProfileStore['currentProfileIds'],
) {
  const filePath = await resolve('./profiles.json');
  await writeTextFile(
    filePath,
    JSON.stringify({ profiles: profiles, currentProfileIds: currents }),
  );
}

/**
 * Load profile from storage.
 * @returns
 */
async function loadStorage(): Promise<{
  profiles: ProfileStore['profiles'];
  currentProfileIds: ProfileStore['currentProfileIds'];
}> {
  const filePath =
    import.meta.env.MODE === 'development'
      ? await resolve('../src/sample-profiles.json')
      : await resolve('./profiles.json');

  let returnProfiles: {
    profiles: ProfileStore['profiles'];
    currentProfileIds: ProfileStore['currentProfileIds'];
  };

  if (await exists(filePath)) {
    const text = await readTextFile(filePath);
    const data = JSON.parse(text);

    returnProfiles = {
      profiles: data.profiles,
      currentProfileIds: data.currentProfileIds,
    };
  } else {
    returnProfiles = {
      profiles: {},
      currentProfileIds: {},
    };
  }

  return returnProfiles;
}

function App() {
  const isListening = useRef(false);
  const [isInitialized, setInitialized] = useState(false);
  const windowStore = useWindow();
  const profile = useProfile();
  const message = useMessage();
  const hid = useHiD();

  useEffect(() => {
    if (!isInitialized) {
      // Loading profile and it save to store.
      loadStorage().then(({ profiles, currentProfileIds }) => {
        profile.initializeProfiles(profiles);
        profile.initializeCurrents(currentProfileIds);
        setInitialized(true);
      });

      // When the profile is updated, it is stored in storage.
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      // Get list of hid devices and it save to store.
      getHidDevices().then((devices) => {
        devices.forEach((device) => {
          hid.addDevice(device);
        });

        devices.forEach((device) => {
          const { path } = device;
          if (profile.currentProfileIds[path] !== undefined) {
            const { current } = profile?.currentProfileIds[path];

            if (current !== null) {
              const currentProfile = profile.profiles[path][current];
              sendProfile(currentProfile.keySettings, device);
            }
          }
        });
      });
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      console.log('SAVE PROFILE CHANGE');
      hid.devices.forEach((device) => {
        const { path } = device;
        if (profile.currentProfileIds[path] !== undefined) {
          const { current } = profile?.currentProfileIds[path];

          if (current !== null) {
            const currentProfile = profile.profiles[path][current];
            sendProfile(currentProfile.keySettings, device);
          }
        }
      });

      if (import.meta.env.MODE !== 'development') {
        saveStorage(profile.profiles, profile.currentProfileIds);
      }
    }
  }, [profile.currentProfileIds]);

  useEffect(() => {
    if (isInitialized) {
      console.log('PROFILE UPDATE');
      hid.devices.forEach((device) => {
        const { path } = device;
        if (profile.currentProfileIds[path] !== undefined) {
          const { current } = profile?.currentProfileIds[path];

          if (current !== null) {
            const currentProfile = profile.profiles[path][current];
            sendProfile(currentProfile.keySettings, device);
          }
        }
      });

      if (import.meta.env.MODE !== 'development') {
        saveStorage(profile.profiles, profile.currentProfileIds);
      }
    }
  }, [profile.profiles]);

  // If device does not exist in profiles, creating the default profile.
  useEffect(() => {
    hid.devices.forEach((device) => {
      const { path } = device;

      if (profile.profiles[path] === undefined) {
        const defaultClone = structuredClone(defaultKeySettings);

        profile.pushProfile(
          {
            name: 'default',
            keySettings: defaultClone,
            exeFilePaths: [],
            devicePath: path,
          },
          path,
          'default',
        );
        profile.setCurrentProfileId('default', path);
      }
    });
  }, [hid.devices, profile.profiles]);

  // Watch window name and exe name of process for current window.
  useEffect(() => {
    if (!isListening.current) {
      isListening.current = true;

      listen<{ window_name: Uint8Array; module_name: Uint8Array }>('WINDOW_CHANGE', (e) => {
        const { module_name } = e.payload;
        const moduleNameStr = Encoding.codeToString(module_name);
        windowStore.setModuleName(moduleNameStr);
      });

      invoke<string>('get_exe_path').then((selfExecutableFilePath) => {
        windowStore.setSelfExecutableFilePath(selfExecutableFilePath);
        return;
      });
    }
  }, []);

  useEffect(() => {
    Object.keys(profile.profiles).forEach((devicePath) => {
      const deviceProfiles = profile.profiles[devicePath];
      const { current, before } = profile.currentProfileIds[devicePath];

      Object.keys(deviceProfiles).forEach((profileId) => {
        const { exeFilePaths } = deviceProfiles[profileId];

        if (exeFilePaths.includes(windowStore.moduleName)) {
          if (current !== null) {
            profile.setBeforeProfileId(current, devicePath);
          }
          profile.setCurrentProfileId(profileId, devicePath);
        } else {
          if (windowStore.selfExecutableFilePath === windowStore.moduleName) {
          } else {
            before !== null && profile.setCurrentProfileId(before, devicePath);
          }
        }
      });
    });
  }, [windowStore.moduleName]);

  return (
    <Box>
      <BrowserRouter>
        <RouterInner />
        <Navbar />

        <Box
          sx={{
            p: 5,
            mt: 5,
          }}
        >
          <Routes>
            <Route path="/performance" element={<Performance />} />
            <Route path="/" element={<Top />} />
          </Routes>
        </Box>

        <Snackbar
          message={message.message}
          open={message.isOpen}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        />
      </BrowserRouter>
    </Box>
  );
}

export default App;
