import { useProfile } from '../../../store/profile';
import MenuItem from '@mui/material/MenuItem';
import { Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { useHiD } from '../../../store/hid';

export function ProfileSelector() {
  const profile = useProfile();
  const hid = useHiD();

  const currentDevice =
    hid.currentDevicePath !== null ? hid.getDevice(hid.currentDevicePath) : null;

  const currentProfileId =
    currentDevice === null ? null : profile.currentProfileIds[currentDevice.path].current;

  const handleSelect = (e: SelectChangeEvent<string>) => {
    if (currentDevice !== null) {
      profile.setCurrentProfileId(e.target.value, currentDevice.path);
    }
  };

  return (
    currentDevice !== null &&
    currentProfileId !== null && (
      <Select value={currentProfileId} onChange={handleSelect}>
        {Object.keys(profile.profiles[currentDevice.path]).map((profileId, index) => (
          <MenuItem value={profileId} key={index}>
            {profile.profiles[currentDevice.path][profileId].name}
          </MenuItem>
        ))}
      </Select>
    )
  );
}
