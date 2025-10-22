const { app, BrowserWindow, globalShortcut, shell } = require('electron');
const path = require('path');


const APP_URL = process.env.APPLE_MUSIC_URL || 'https://music.apple.com';


let mainWindow;


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 820,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
                                   sandbox: false,
                                   nodeIntegration: false,
                                   contextIsolation: true
        },
        autoHideMenuBar: true,
        show: false,
        titleBarStyle: 'default'
    });


    // Slightly change the user agent so Apple serves the web app correctly
    const ua = mainWindow.webContents.getUserAgent();
    const customUA = ua.replace(/Electron\/[^ ]+/, ''); // remove Electron token


    mainWindow.webContents.setUserAgent(customUA);


    mainWindow.loadURL(APP_URL).catch(err => console.error('Failed to load URL', err));


    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });


    // open external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        const allowedOrigin = new URL(APP_URL).origin;
        try {
            if (new URL(url).origin === allowedOrigin) {
                return { action: 'allow' };
            }
        } catch (e) {}
        shell.openExternal(url);
        return { action: 'deny' };
    });


    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


app.whenReady().then(() => {
    createWindow();


    try {
        globalShortcut.register('MediaPlayPause', () => {
            mainWindow && mainWindow.webContents.executeJavaScript(`(function(){const btn=document.querySelector('[data-testid=\"play-button\"]'); if(btn) btn.click();})()`);
        });
    } catch (e) {
        console.warn('Media key registration failed', e);
    }


    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

