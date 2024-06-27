import { Box } from '@mui/material';
import { Profile, getKeySettingValueByKeyName } from '../../store/profile';

type KeybordOnKeyClick = (keyName: string) => void;

export function Keybord({
  keyMaping,
  profile,
  onClick,
  selectingKeys,
}: {
  keyMaping: string[][];
  profile: Profile;
  onClick: KeybordOnKeyClick;
  selectingKeys: string[];
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px 0px',
      }}
    >
      {keyMaping.map((line, index) => (
        <KeybordLine
          line={line}
          key={index}
          profile={profile}
          onClick={onClick}
          selectingKeys={selectingKeys}
        />
      ))}
    </Box>
  );
}

function KeybordLine({
  line,
  profile,
  onClick,
  selectingKeys,
}: {
  line: string[];
  profile: Profile;
  onClick: KeybordOnKeyClick;
  selectingKeys: string[];
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '5px',
      }}
    >
      {line.map((keyName, index) => (
        <Key
          keyName={keyName}
          key={index}
          profile={profile}
          onClick={onClick}
          selected={selectingKeys.includes(keyName)}
        />
      ))}
    </Box>
  );
}

function Key({
  keyName,
  profile,
  onClick,
  selected,
}: {
  keyName: string;
  profile: Profile;
  onClick: KeybordOnKeyClick;
  selected: boolean;
}) {
  const { action_point, upstroke, downstroke } = getKeySettingValueByKeyName(
    keyName,
    profile.keySettings,
  );

  return (
    <Box
      sx={{
        p: '10px',
        bgcolor: selected ? '#816fb3' : '#606060',
        color: '#ffffff',
        borderRadius: '10px',
        minWidth: '60px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={() => {
        onClick(keyName);
      }}
    >
      <span>{keyName}</span>
      <span>
        {action_point}, {upstroke}, {downstroke}
      </span>
    </Box>
  );
}
