const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path')
var savedCtrl = true;
//Window View
var mainWindow = null;
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    await mainWindow.loadFile('src/pages/textEditor/index.html');
    createNewFile();
    ipcMain.on('update-content', function (event, data) {
        file.content = data;
        savedCtrl = false;
    });
}
//Novo Arquivo
var file = {};
async function createNewFile() {
    if (!savedCtrl) {
        await notSave();
    }
    file = {
        name: 'novoTextEditor.txt',
        content: '',
        saved: false,
        path: app.getPath('documents') + '/novoTextEditor.txt'
    };
    //setFile => send('nome do evento', arquivo)
    mainWindow.webContents.send('set-file', file);
}
function writeFile(filePath) {
    try {
        fs.writeFile(filePath, file.content, function (error) {
            if (error) {
                throw erro;
            }
            file.path = filePath;
            file.saved = true;
            file.name = path.basename(filePath);
            mainWindow.webContents.send('set-file', file);
        })
    } catch (e) {
        console.log(e);
    }
}
async function saveFileAs() {
    let dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path
    });
    if (dialogFile.canceled) { return false; }
    writeFile(dialogFile.filePath)
}
function saveFile() {
    if (file.saved) {
        return writeFile(file.path);
    }
    return saveFileAs();
}
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        console.log(e);
        return '';
    }
}
function notSave() {
    if (!savedCtrl) {
        console.log('Documento ainda não foi salvo');
        savedCtrl = true;
        return saveFileAs();
    }
}
async function openFile() {
    if (!savedCtrl) {
        await notSave();
    }
    let dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path
    });
    if (dialogFile.canceled) { return false; }
    file = {
        name: path.basename(dialogFile.filePaths[0]),
        content: readFile(dialogFile.filePaths[0]),
        saved: true,
        path: dialogFile.filePaths[0]
    }
    mainWindow.webContents.send('set-file', file);
}
//Menu
const templateMenu = [
    {
        label: 'Aquivo',
        submenu: [
            {
                label: 'Novo',
                accelerator: 'CmdOrCtrl+N',
                click() {
                    createNewFile();
                }
            },
            {
                label: 'Abrir',
                accelerator: 'CmdOrCtrl+O',
                click() {
                    openFile();
                }
            },
            {
                label: 'Salvar',
                accelerator: 'CmdOrCtrl+S',
                click() {
                    saveFile();
                }
            },
            {
                label: 'Salvar como',
                accelerator: 'CmdOrCtrl+Shift+S',
                click() {
                    saveFileAs();
                }

            },
            {
                label: 'Fechar',
                accelerator: 'CmdOrCtrl+Q',
                role: process.platform === 'darwin' ? 'close' : 'quit'
            }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            {
                label: 'Desfazer',
                role: 'undo'
            },
            {
                label: 'Refazer',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Recortar',
                role: 'cut'
            },
            {
                label: 'Copiar',
                role: 'copy'
            },
            {
                label: 'Colar',
                role: 'paste'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Desenvolvedor',
                click() {
                    shell.openExternal('https://www.linkedin.com/in/maiko-defreyn/')
                }
            }
        ]
    }
];
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);
//On Ready
app.whenReady().then(createWindow);
// On Activate
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}); 