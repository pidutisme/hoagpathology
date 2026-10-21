const { app, BrowserWindow, shell } = require('electron');
const fs = require('fs');
const path = require('path');

function getProductionUrl() {
  const configPath = path.join(process.resourcesPath, 'desktop-config.json');
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.productionUrl && !config.productionUrl.includes('YOUR-VERCEL-DOMAIN')) return config.productionUrl;
  } catch (_) {}
  return 'https://YOUR-VERCEL-DOMAIN.vercel.app';
}

function createWindow() {
  const url = getProductionUrl();
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1000, minHeight: 700,
    title: 'Hoag Pathology', autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.loadURL(url);
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
