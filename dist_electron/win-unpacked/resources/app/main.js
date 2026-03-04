const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');
const fs = require('fs');

let localServer = null;
let localPort = null;

// Ensure logs go to a file we can read if needed
const logFile = path.join(app.getPath('userData'), 'tylock-log.txt');
function log(msg) {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(msg);
    fs.appendFileSync(logFile, entry);
}

log('--- App Starting ---');

function startServer(webRoot, callback) {
    const expressApp = express();

    expressApp.use((req, res, next) => {
        log(`[Express] Request: ${req.url}`);
        next();
    });

    expressApp.use(express.static(webRoot));

    expressApp.get('*', (req, res) => {
        const indexPath = path.join(webRoot, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('index.html not found');
        }
    });

    const server = http.createServer(expressApp);
    server.listen(0, '127.0.0.1', () => {
        localPort = server.address().port;
        localServer = server;
        log(`[Express] Server running on http://127.0.0.1:${localPort}`);
        callback(null, localPort);
    });
    server.on('error', (err) => {
        log(`[Express] Server error: ${err.message}`);
        callback(err);
    });
}

function createWindow() {
    const isDev = !app.isPackaged;
    log(`[Electron] isPackaged: ${app.isPackaged}`);

    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        backgroundColor: '#0a0a0e',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, 'build/icon.png'),
    });

    win.setMenu(null);
    win.webContents.openDevTools();

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        log(`[Electron] Page failed to load: ${errorCode} - ${errorDescription} at ${validatedURL}`);
        if (errorCode !== -3) {
            dialog.showErrorBox('Page Load Error', `Error ${errorCode}: ${errorDescription}\nURL: ${validatedURL}`);
        }
    });

    if (isDev) {
        log('[Electron] Loading dev URL');
        win.loadURL('http://localhost:3000');
        return;
    }

    const webRoot = path.join(__dirname, 'dist');
    log(`[Electron] webRoot path: ${webRoot}`);

    if (!fs.existsSync(path.join(webRoot, 'index.html'))) {
        const errorMsg = `Missing App Files\nCould not find index.html at:\n${path.join(webRoot, 'index.html')}\n\nApp Path: ${app.getAppPath()}\nDirname: ${__dirname}`;
        log(`[Electron] Error: ${errorMsg}`);
        dialog.showErrorBox('Missing App Files', errorMsg);
        return;
    }

    if (localServer && localPort) {
        win.loadURL(`http://127.0.0.1:${localPort}`);
    } else {
        startServer(webRoot, (err, port) => {
            if (err) {
                dialog.showErrorBox('Server Error', `Failed to start local server: ${err.message}`);
                return;
            }
            const url = `http://127.0.0.1:${port}`;
            log(`[Electron] Loading production URL: ${url}`);
            win.loadURL(url);
        });
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
