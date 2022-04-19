const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { ImagePool } = require("@squoosh/lib");
const fs = require("fs/promises");
const chunk = require("lodash/chunk");
const os = require("os");

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadURL("http://localhost:3000");

  return mainWindow;
};

let mainWindow;

app.whenReady().then(() => {
  mainWindow = createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

const compressImage = async (imagePool, filePath) => {
  const image = imagePool.ingestImage(filePath);
  await image.decoded;
  await image.preprocess();
  await image.encode({ mozjpeg: {} });

  const rawEncodedImage = (await image.encodedWith.mozjpeg).binary;
  await fs.writeFile(filePath, rawEncodedImage);
  mainWindow.webContents.send("image-compressed", filePath);
};

ipcMain.on("compress-images", async (_event, filePaths) => {
  const imagePool = new ImagePool(os.cpus().length);
  const chunkedFilePaths = chunk(filePaths, 10);

  for (const chunk of chunkedFilePaths) {
    await Promise.all(
      chunk.map((filePath) => compressImage(imagePool, filePath))
    );
  }

  imagePool.close();
});
