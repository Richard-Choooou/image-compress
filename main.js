// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')
const electron = require('electron')
const path = require('path')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ 
        width: 800, 
        height: 600, 
        webPreferences: { 
            webSecurity: false,
            preload: path.resolve(__dirname, './public/renderer.js')
        },
    })
    mainWindow.setMinimumSize(800, 600)
    mainWindow.webContents.openDevTools()
    // mainWindow.set
    // and load the index.html of the app.
    //   mainWindow.loadFile('index.html')
    mainWindow.loadURL('http://127.0.0.1:3000')
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    setMenu()

    function setMenu() {
        const template = [
            {
                label: '设置',
                submenu: [
                    { 
                        label: '文件存储位置' 
                    },
                    { 
                        role: 'toggledevtools'
                    }
                ]
            },
            {
                label: 'fork me on github',
                submenu: [
                    {
                        label: 'fork me on github',
                        click() { require('electron').shell.openExternal('https://github.com/Richard-Choooou/image-compress') }
                    }
                ]
            }
        ]


        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

