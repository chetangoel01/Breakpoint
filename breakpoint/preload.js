const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  toggleMiniMode: (isMinimized) =>
    ipcRenderer.invoke("toggle-mini-mode", isMinimized),
  restoreFromMini: () => ipcRenderer.invoke("restore-from-mini"),
  updateFatigueDetection: (enabled) =>
    ipcRenderer.invoke("update-fatigue-detection", enabled),
  clearCache: () => ipcRenderer.invoke("clear-cache"),
});

contextBridge.exposeInMainWorld("drowsiness", {
  predictFromBase64: (base64) => ipcRenderer.invoke("predict-image", base64),
  onMiniStatusUpdate: (callback) => {
    // Remove any existing listeners first
    ipcRenderer.removeAllListeners("mini-status");

    // Add the new listener
    ipcRenderer.on("mini-status", (_event, status) => {
      callback(status);
    });
  },
});

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
  },
});