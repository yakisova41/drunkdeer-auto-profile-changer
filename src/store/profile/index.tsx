import { create } from 'zustand';

const updateHandlers: ((state: ProfileStore) => void)[] = [];

export const useProfile = create<ProfileStore>((set) => ({
  profiles: {},
  length: 0,
  currentProfileIds: {},
  initializeProfiles: (profiles: Record<string, DeviceProfiles>) => {
    set(() => ({
      profiles,
    }));
  },
  initializeCurrents: (currentProfileIds: Record<DevicePath, CurrentProfileId>) => {
    set(() => ({
      currentProfileIds,
    }));
  },
  pushProfile: (newProfile: Profile, devicePath: DevicePath, id: null | string = null) => {
    let profileId: string;
    if (id === null || id === undefined) {
      profileId = crypto.randomUUID();
    } else {
      profileId = id;
    }

    set((state) => {
      const newProfiles = structuredClone(state.profiles);
      if (newProfiles[devicePath] === undefined) {
        newProfiles[devicePath] = {};
      }
      newProfiles[devicePath][profileId] = newProfile;
      return { profiles: newProfiles, length: state.length + 1 };
    });
    set((state) => {
      updateHandlers.forEach((h) => {
        h(state);
      });
      return state;
    });
    return profileId;
  },
  updateProfile: (id: string, devicePath: DevicePath, newProfile: Profile) => {
    set((state) => {
      const newProfiles = structuredClone(state.profiles);
      newProfiles[devicePath][id] = newProfile;
      return { profiles: newProfiles };
    });
    set((state) => {
      updateHandlers.forEach((h) => {
        h(state);
      });
      return state;
    });
  },
  useUpdate: (updateHandler) => {
    updateHandlers.push(updateHandler);
    return () => {
      const i = updateHandlers.indexOf(updateHandler);
      updateHandlers.splice(i, 1);
    };
  },
  removeProfile: (id: string, devicePath: DevicePath) => {
    set((state) => {
      const newProfiles = structuredClone(state.profiles);
      delete newProfiles[devicePath][id];
      return { length: state.length - 1, profiles: newProfiles };
    });
    set((state) => {
      updateHandlers.forEach((h) => {
        h(state);
      });
      return state;
    });
  },
  setCurrentProfileId: (id: string | null, devicePath: DevicePath) => {
    set((state) => {
      const newCurrentProfileIds: Record<DevicePath, CurrentProfileId> = {
        ...state.currentProfileIds,
        [devicePath]: {
          current: id,
          before:
            state.currentProfileIds[devicePath]?.before === undefined
              ? null
              : state.currentProfileIds[devicePath].before,
        },
      };
      set((state) => {
        updateHandlers.forEach((h) => {
          h(state);
        });
        return state;
      });

      return { currentProfileIds: newCurrentProfileIds };
    });
  },
  setBeforeProfileId: (id: string | null, devicePath: DevicePath) => {
    set((state) => {
      const newCurrentProfileIds: Record<DevicePath, CurrentProfileId> = {
        ...state.currentProfileIds,
        [devicePath]: {
          current:
            state.currentProfileIds[devicePath]?.current === undefined
              ? null
              : state.currentProfileIds[devicePath].current,
          before: id,
        },
      };

      return { currentProfileIds: newCurrentProfileIds };
    });
  },
}));

export function getKeySettingValueByKeyName(requireKeyName: string, setting: KeySetting[]) {
  let settingValue = undefined;
  setting.forEach((value) => {
    if (value.keyname === requireKeyName) {
      settingValue = value;
    }
  });

  if (settingValue === undefined) {
    throw new Error(`getKeySettingValueByKeyName ${requireKeyName}`);
  }

  return settingValue;
}

export interface KeySetting {
  action_point: number;
  downstroke: number;
  keyname: string;
  upstroke: number;
}

export interface Profile {
  keySettings: KeySetting[];
  devicePath: string;
  exeFilePaths: string[];
  name: string;
}

export type DevicePath = string;
export type ProfileId = string;
export type DeviceProfiles = Record<ProfileId, Profile>;
export interface CurrentProfileId {
  current: null | ProfileId;
  before: null | ProfileId;
}

export interface ProfileStore {
  profiles: Record<DevicePath, DeviceProfiles>;
  length: number;
  initializeProfiles: (profiles: Record<string, DeviceProfiles>) => void;
  initializeCurrents: (currentProfileIds: Record<DevicePath, CurrentProfileId>) => void;
  pushProfile: (newProfile: Profile, devicePath: DevicePath, id?: null | string) => string;
  updateProfile: (id: string, devicePath: DevicePath, newProfile: Profile) => void;
  removeProfile: (id: string, devicePath: DevicePath) => void;
  currentProfileIds: Record<DevicePath, CurrentProfileId>;
  setCurrentProfileId: (id: string | null, devicePath: DevicePath) => void;
  setBeforeProfileId: (id: string | null, devicePath: DevicePath) => void;
  useUpdate: (updateHandler: (state: ProfileStore) => void) => UnlistenProfileStoreListen;
}

export type UnlistenProfileStoreListen = () => void;
