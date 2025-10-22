const { app, BrowserWindow, Menu, shell, session } = require("electron");
const path = require("path");
const Store = require("electron-store");

// Initialize store for user preferences
const store = new Store();

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Apple Music",
    icon: path.join(__dirname, "../build/icons/512x512.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
      spellcheck: true,
    },
  });

  // Set proper Content-Security-Policy headers
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' https://*.apple.com https://*.mzstatic.com; " +
            "script-src 'self' 'unsafe-inline' https://*.apple.com https://*.mzstatic.com; " +
            "style-src 'self' 'unsafe-inline' https://*.apple.com https://*.mzstatic.com; " +
            "img-src 'self' data: https://*.apple.com https://*.mzstatic.com; " +
            "connect-src 'self' https://*.apple.com https://*.mzstatic.com; " +
            "media-src 'self' https://*.apple.com https://*.mzstatic.com; " +
            "object-src 'none';",
        ],
      },
    });
  });

  // Load Apple Music
  mainWindow.loadURL("https://music.apple.com");

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // Save window position and size
  mainWindow.on("close", () => {
    const bounds = mainWindow.getBounds();
    store.set("windowBounds", bounds);
  });

  // Create menu
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [{ role: "quit" }],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  // Restore window position and size if available
  const savedBounds = store.get("windowBounds");
  if (savedBounds) {
    mainWindow.setBounds(savedBounds);
  }

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
