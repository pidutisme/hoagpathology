const { app, BrowserWindow, shell } = require('electron');
const fs = require('fs');
const path = require('path');

function getProductionUrl() {
  const configPath = path.join(process.resourcesPath, 'desktop-config.json');
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.productionUrl && !config.productionUrl.includes('YOUR-VERCEL-DOMAIN')) return config.productionUrl;
  } catch (_) {}
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
