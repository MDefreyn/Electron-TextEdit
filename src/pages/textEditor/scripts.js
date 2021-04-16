const { ipcRenderer } = require('electron');
//Elementos
const textarea = document.getElementById('text');
const title = document.getElementById('title');
//getFile
ipcRenderer.on('set-file', function (event, data) {
    textarea.value = data.content;
    title.innerHTML = data.name + ' | TextEditor';
});
function handleChangeText() {
    ipcRenderer.send('update-content', textarea.value);
}