/**
 * Preload.js - Usado no framework electron para aumentar a segurança e o desempenho
 */

//ipcRenderer permite estabelecer uma comunicação entre processos (IPC) main.js <--> renderer.js (comunicação em duas vias)

const {ipcRenderer, contextBridge} = require('electron')

//Enviar uma mensagem para o main.js estabelecer uma conexão com o banco de dados quando iniciar a aplicação
ipcRenderer.send('db-connect')

//permissões para estabelecer a comunicação entre processos

contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message)
})