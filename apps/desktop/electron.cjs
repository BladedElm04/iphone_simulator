const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("node:path");
const { createWebKitRuntime } = require("./webkit-runtime.cjs");

let mainWindow = null;

function sendToMainWindow(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
}

const webkitRuntime = createWebKitRuntime({
  onFrame: (frame) => sendToMainWindow("webkit:frame", frame),
  onState: (state) => sendToMainWindow("webkit:state", state)
});

// Every handler answers `{ ok: true, ... }` or `{ ok: false, error }` and only
// accepts calls coming from the application window.
function handle(channel, action) {
  ipcMain.handle(channel, async (event, payload) => {
    if (!mainWindow || event.sender !== mainWindow.webContents) {
      return { ok: false, error: "Untrusted sender." };
    }
    try {
      return { ok: true, ...(await action(payload)) };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
}

handle("webkit:start", (options) => webkitRuntime.start(options || {}));
handle("webkit:stop", () => webkitRuntime.stop());
handle("webkit:navigate", (url) => webkitRuntime.navigate(url));
handle("webkit:back", () => webkitRuntime.goBack());
handle("webkit:forward", () => webkitRuntime.goForward());
handle("webkit:reload", () => webkitRuntime.reload());
handle("webkit:resize", (size) => webkitRuntime.resize(size || {}));
handle("webkit:input", (event) => webkitRuntime.input(event));

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
      sandbox: true,
      webviewTag: true,
      preload: path.join(__dirname, "preload.cjs")
    }
  });
  mainWindow = window;
  window.on("closed", () => {
    if (mainWindow === window) mainWindow = null;
  });

  if (app.isPackaged) {
    window.loadFile(path.join(__dirname, "../../dist/index.html"));
  } else {
    window.loadURL(process.env.VITE_DEV_SERVER_URL || "http://localhost:5174");
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
  void webkitRuntime.stop();
  if (process.platform !== "darwin") app.quit();
});
