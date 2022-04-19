const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  compressImage: (filePath) => ipcRenderer.send("compress-image", filePath),
  compressImages: (filePaths) => ipcRenderer.send("compress-images", filePaths),
  onImageCompressed: (callback) => ipcRenderer.on("image-compressed", callback),
});
