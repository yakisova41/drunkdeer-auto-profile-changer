import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import { useState } from 'react';

export function CreateProfile({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (profileName: string) => void;
}) {
  const [value, setVal] = useState('');

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    setVal(e.target.value);
  };

  const handleCreate = () => {
    onCreate(value);
  };

  return (
    <Box>
      <Box>
        <Input type="text" placeholder="Profile name" onChange={handleChange}></Input>
        <Button onClick={handleCreate}>Create</Button>
        <Button color="error" onClick={onClose}>
          CANCEL
        </Button>
      </Box>
    </Box>
  );
}
