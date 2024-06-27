const AutoLaunch = require('auto-launch');

const autoLauncher = new AutoLaunch({
  name: 'Drunkdeer Auto Profile Changer',
  path: process.execPath,
});

autoLauncher
  .isEnabled()
  .then((isEnabled) => {
    if (!isEnabled) autoLauncher.enable();
  })
  .catch((err) => {
    console.error('Failed to set auto-launch:', err);
  });
