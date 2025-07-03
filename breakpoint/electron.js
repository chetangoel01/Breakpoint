const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let win;
let originalBounds = null;
let isMiniMode = false;
let latestStatus = "alert"; // Store the latest aggregated status

function createWindow() {
  win = new BrowserWindow({
    width: 600,
    height: 400,
    resizable: true,
    transparent: true,
    hasShadow: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Set camera permissions
  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Enable camera access
  win.webContents.session.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'media') {
      return true;
    }
    return false;
  });

  win.setAspectRatio(1.5);
  win.loadURL('http://localhost:3000');

  // Store original bounds when window is created
  originalBounds = win.getBounds();

  // Completely block the minimize event - prevent any default minimize behavior
  win.on('minimize', (e) => {
    e.preventDefault();
  });

  win.on('close', (e) => {
    // Clean up any resources if needed
  });

  win.on('resize', () => {
    if (!isMiniMode) {
      originalBounds = win.getBounds();
    }
  });

  win.on('move', () => {
    if (!isMiniMode) {
      originalBounds = win.getBounds();
    }
  });
}

function enterMiniMode() {
  if (!win || isMiniMode) return;
  
  originalBounds = win.getBounds();
  isMiniMode = true;

  win.setAlwaysOnTop(true);
  win.setSkipTaskbar(true);
  win.setResizable(false);
  
  win.setAspectRatio(0);
  
  win.setBounds({
    x: 30,
    y: 30,
    width: 190,
    height: 256
  });
}

function exitMiniMode() {
  if (!win || !isMiniMode) return;
  
  isMiniMode = false;

  win.setAlwaysOnTop(false);
  win.setSkipTaskbar(false);
  win.setResizable(true);
  
  if (originalBounds) {
    win.setBounds(originalBounds);
  } else {
    win.setBounds({
      x: 100,
      y: 100,
      width: 600,
      height: 400
    });
  }
  
  win.setAspectRatio(1.5);
  
  win.focus();
}

app.whenReady().then(createWindow);

ipcMain.on('toggle-mini-mode', (event, shouldEnterMiniMode) => {
  if (!win) return;

  console.log('🔄 [MAIN] Toggle mini mode:', shouldEnterMiniMode);

  if (shouldEnterMiniMode) {
    enterMiniMode();
    // Send current status to mini window when entering mini mode
    if (latestStatus) {
      console.log('📤 [MAIN] Entering mini mode - sending current status:', latestStatus);
      win.webContents.send("mini-status", latestStatus);
    } else {
      console.log('⚠️ [MAIN] Entering mini mode but no latestStatus available');
    }
  } else {
    exitMiniMode();
  }
});

ipcMain.on('restore-from-mini', () => {
  exitMiniMode();
});

// Handle aggregated status from fatigue detector
ipcMain.on('aggregated-status', (event, status) => {
  latestStatus = status;
  console.log('📥 [MAIN] Received aggregated status:', status);
  console.log('📍 [MAIN] isMiniMode:', isMiniMode, 'win exists:', !!win);
  
  // If in mini mode, send status immediately to the renderer
  if (win && isMiniMode) {
    console.log('📤 [MAIN] Sending status to mini window:', latestStatus);
    win.webContents.send("mini-status", latestStatus);
  } else {
    console.log('⏸️ [MAIN] Not sending to mini window - either not in mini mode or window not available');
  }
});

// Handle ML prediction
ipcMain.handle('predict-image', async (event, base64Image) => {
  return new Promise((resolve, reject) => {
    // Get the path to the model directory
    const modelPath = path.join(__dirname, '..', 'model');
    const scriptPath = path.join(modelPath, 'predict.py');
    
    // Spawn Python process (using conda python which has dependencies)
    const python = spawn('python', [scriptPath], {
      cwd: modelPath,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    // Send base64 image data to Python script
    const inputData = JSON.stringify({ image: base64Image });
    python.stdin.write(inputData);
    python.stdin.end();

    // Collect output
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch (err) {
          reject(new Error(`Failed to parse Python output: ${output}`));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
      }
    });

    python.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
