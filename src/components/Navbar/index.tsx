import { AppBar, Box, IconButton, Toolbar, Typography, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import { appWindow } from '@tauri-apps/api/window';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingTop: theme.spacing(0),
  paddingBottom: theme.spacing(0),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  // Override media queries injected by theme.mixins.toolbar
  '@media all': {
    minHeight: 23,
    paddingLeft: 15,
    paddingRight: 5,
  },
  cursor: 'default',
  userSelect: 'none',
}));

export const Navbar = () => {
  const handleClose: React.MouseEventHandler<HTMLElement> = () => {
    // e.preventDefault();
    //e.stopPropagation();
    appWindow.hide();
  };

  const handleSwtichMaxWindow: React.MouseEventHandler<HTMLElement> = () => {
    //   e.preventDefault();

    appWindow.toggleMaximize();
  };

  const handleMin: React.MouseEventHandler<HTMLElement> = () => {
    // e.preventDefault();
    // e.stopPropagation();
    appWindow.minimize();
  };

  const handleMouseDown: React.MouseEventHandler<HTMLElement> = (e) => {
    e.stopPropagation();
    appWindow.startDragging();
  };

  return (
    <>
      <AppBar position="fixed" onMouseDown={handleMouseDown}>
        <StyledToolbar>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0 10px',
              flexGrow: 1,
            }}
          >
            <Typography variant="body1" component="div">
              DrunkDeer Auto Profile Changer (DAPC)
            </Typography>

            <Typography variant="body2" component="span">
              Version: v0.1.0 / Code of Web driver V0.48 included
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: '0px 15px',
              paddingX: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={handleMin}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              <MinimizeIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleSwtichMaxWindow}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              <CropSquareIcon />
            </IconButton>
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </StyledToolbar>
      </AppBar>
    </>
  );
};
