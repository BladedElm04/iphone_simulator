const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1050,
    minHeight: 720,
    backgroundColor: "#08090d",
    title: "iPhone Simulator",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (app.isPackaged) {
    window.loadFile(path.join(__dirname, "../../dist/index.html"));
  } else {
    window.loadURL(process.env.VITE_DEV_SERVER_URL || "http://localhost:5173");
    window.webContents.openDevTools({ mode: "detach" });
  }

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
