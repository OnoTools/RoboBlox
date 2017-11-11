const electron = require('electron')
const path = require('path')
const url = require('url')
const win = require('import-window')
// Module to control application life.
const app = electron.app

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain
// Modules to create menu
const Menu = electron.Menu
const MenuItem = electron.MenuItem


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWin;

function window() { //WindowManager
  mainWin = win.createWindow({
    show: false,
    backgroundColor: '#420024',
    width: 800,
    height: 600,
    frame: false,
    resizable: true,
    maximizable: true,
    backgroundColor: 'gray',
    webPreferences: {
       zoomFactor: 0.9,
     },
    icon: path.join(__dirname, 'assets/icons/png/1024x1024.png')})
  mainWin.setURL(__dirname,"explorer.html")
  mainWin.win.setFullScreenable(false)
  mainWin.win.setResizable(false)
  mainWin.win.setMinimumSize(800,600);
  mainWin.win.setMaximumSize(800,600);
  //mainWin.openDevTools();
  mainWin.win.once('ready-to-show', () => {
    mainWin.win.show()
  })
  win.setDir(__dirname)
  console.log(__dirname)
}
app.on('ready', window)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    window()
  }
})
// In this file you can include the rest of your app's specific main process
