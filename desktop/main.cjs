const { app, BrowserWindow, shell, session } = require('electron');
const fs = require('fs');
const path = require('path');

function getProductionUrl() {
  const candidatePaths = [
    path.join(process.resourcesPath, 'desktop-config.json'),
    path.join(__dirname, 'config.json'),
    path.join(__dirname, 'desktop-config.json')
  ];
  for (const configPath of candidatePaths) {
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.productionUrl && !config.productionUrl.includes('YOUR-VERCEL-DOMAIN')) return config.productionUrl;
      }
    } catch (_) {}
  }
  throw new Error('Desktop production URL is not configured. Check desktop/config.json.');
}

function createWindow() {
  let url;
  try {
    url = getProductionUrl();
  } catch (error) {
    const { dialog } = require('electron');
    dialog.showErrorBox('Hoag Pathology', error.message);
    app.quit();
    return;
  }

  const allowedOrigin = new URL(url).origin;

  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1000, minHeight: 700,
    title: 'Hoag Pathology', autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: false
    }
  });

  win.webContents.on('will-navigate', (event, targetUrl) => {
    try {
      const target = new URL(targetUrl);
      if (target.origin !== allowedOrigin) {
        event.preventDefault();
        if (target.protocol === 'https:' || target.protocol === 'http:') shell.openExternal(target.href);
      }
    } catch (_) {
      event.preventDefault();
    }
  });

  win.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    try {
      const target = new URL(targetUrl);
      if (target.protocol === 'https:' || target.protocol === 'http:') shell.openExternal(target.href);
    } catch (_) {}
    return { action: 'deny' };
  });

  win.webContents.on('will-redirect', (event, targetUrl) => {
    try {
      const target = new URL(targetUrl);
      if (target.origin !== allowedOrigin) event.preventDefault();
    } catch (_) {
      event.preventDefault();
    }
  });

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.warn('Hoag Pathology desktop load failed:', errorCode, errorDescription);
  });

  win.loadURL(url);
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
