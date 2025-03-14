console.log("Electron - Processo principal")

//importação dos recursos do framework

const {app, BrowserWindow, nativeTheme, Menu, shell} = require('electron/main')

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


//compatibilização com MAC
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin'){
    app.quit()
  }
})

//Reduzir a verbosidade de logs não criticos (devtools)
app.commandLine.appendSwitch('log-level', '3')

//tamplate do menu
const template = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'Sair',
        accelerator: 'Alt+F4',
        click: () => app.quit()
      },
    ]
  },
  {
  label: 'Relatório',
  submenu: [
    {
      label: 'Clientes'
    }
  ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Aplicar Zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar o zoom Padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label:'DevTools',
        role:'toggleDevTools'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Repositório',
        click: () => shell.openExternal('https://github.com/denisdangelo/cadastroV1.git')
    },
    {
      label: 'Sobre',
      click:() => aboutWindow()
    }
    ]
  
  }
]