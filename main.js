console.log("Electron - Processo principal")

//importação dos recursos do framework

const {app, BrowserWindow, nativeTheme, Menu, Shell} = require('electron/main')

//criação da janela principal
let win //win é a variavel que receberá a classe modelo que cria a janela 
const createWindow = () => {
    //definir o thema da janela ('dark", 'light' ou 'system')
    nativeTheme.themeSource = 'dark'
    //atribuindo as formas à variavel para criação da janela
    win = new BrowserWindow({
        width: 1010,
        height: 720, 
    })
    //carregar o menu personalizado
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
    //caminho para exibição na janela
    win.loadFile('./src/views/index.html')
}

//Janela Sobre
let about

function aboutWindow() {
    nativeTheme.themeSource= 'light'
    //obter a janela principal (tecnica da janela modal)
    const mainWindow = BrowserWindow.getFocusedWindow()
    //validação (se existe a janela principal)
    if(mainWindow){
      about = new BrowserWindow({
        width: 320,
        height: 280,
        autoHideMenuBar: true,
        resizable: false,
        minimizable: false,
        //estabelecer uma relação hierarquica entre janelas
        parent: mainWindow, //janela pai
        //criar uma janela modal (So retorna a janela pai quando a janela filho é encerrada)
        modal: true
      })
    }
    
    about.loadFile('./src/views/sobre.html')
  }

  //inicialização da aplicação (variavel app)
  app.whenReady().then(() => {
    createWindow()
    //validação se tem outra janela aberta ou não
    //evita abrir mais de uma janela
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0){
            createWindow()
        }
    })
  })

