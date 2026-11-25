const { contextBridge, ipcRenderer } = require("electron");

function subscribe(channel) {
  return (listener) => {
    const handler = (_event, payload) => listener(payload);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  };
}

contextBridge.exposeInMainWorld("desktopRuntime", {
  isElectron: true,
  webkit: {
    start: (options) => ipcRenderer.invoke("webkit:start", options),
    stop: () => ipcRenderer.invoke("webkit:stop"),
    navigate: (url) => ipcRenderer.invoke("webkit:navigate", url),
    goBack: () => ipcRenderer.invoke("webkit:back"),
    goForward: () => ipcRenderer.invoke("webkit:forward"),
    reload: () => ipcRenderer.invoke("webkit:reload"),
    resize: (size) => ipcRenderer.invoke("webkit:resize", size),
    input: (event) => ipcRenderer.invoke("webkit:input", event),
    onFrame: subscribe("webkit:frame"),
    onState: subscribe("webkit:state")
  }
});
