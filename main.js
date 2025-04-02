console.log("Electron - Processo principal")

//importação dos recursos do framework
//dialog modulo electron para ativar caixa de mensagens
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

// Ativação do preload.js (importtação do path)
const path = require('node:path')

//importação dos metodos conectar e desconectar
const { conectar, desconectar } = require('./database.js')

// Importação do modelo de dados (Notes.js)
const clientesModel = require('./src/models/Clientes.js')
const { title } = require('node:process')

//criação da janela principal
let win //win é a variavel que receberá a classe modelo que cria a janela 
const createWindow = () => {
  //definir o thema da janela ('dark", 'light' ou 'system')
  nativeTheme.themeSource = 'dark'

  //atribuindo as formas à variavel para criação da janela
  win = new BrowserWindow({
    width: 1010,
    height: 720,
    //Ponte com o preload
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  //carregar o menu personalizado
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  //caminho para exibição na janela
  win.loadFile('./src/views/index.html')
}

//Janela Sobre
let about

function aboutWindow() {
  nativeTheme.themeSource = 'light'
  //obter a janela principal (tecnica da janela modal)
  const mainWindow = BrowserWindow.getFocusedWindow()
  //validação (se existe a janela principal)
  if (mainWindow) {
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

  //criar o abaut exit do ipc.main
}

//inicialização da aplicação (variavel app)
app.whenReady().then(() => {
  createWindow()

  //estabelecendo conexão com o banco de dados
  ipcMain.on('db-connect', async (event) => {
    //a linha abaixo estabelece uma conexão com o banco de dados
    const conectado = await conectar()
    if (conectado) {
      // enviar ao renderizador uma mensagem para trocar a imagem do icone de status do banco de dados (criar um delay de 0.5 ou 1s para sincronização com a nuvem)
      setTimeout(() => {
        //enviar ao renderizador a mensagem "conectado"
        //db-status (IPC - comunicação entre processos - preload.js)
        //.replay encaminha mensagem 
        event.reply('db-status', "conectado")
      }, 500)
    }
  })
  //validação se tem outra janela aberta ou não
  //evita abrir mais de uma janela
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})


//compatibilização com MAC
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//IMPORTANTE: Desconectar do banco de dados quando a aplicação for finalizada
app.on('before-quit', async () => {
  await desconectar()
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
        label: 'DevTools',
        role: 'toggleDevTools'
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
        click: () => aboutWindow()
      }
    ]

  }
]

// =================================================================
// == CRUD Create ==================================================
ipcMain.on('create-cliente', async (event, cadCliente) => {
  // Importante! Teste de recebimento dos dados do cliente
  console.log(cadCliente)
  // Cadastrar a estrutura de dados no banco de dados MongoDB
  try {
    const createCliente = new clientesModel({
      nome: cadCliente.cnome,
      nasc: cadCliente.cnasc,
      email: cadCliente.cemail,
      cpf: cadCliente.ccpf,
      cep: cadCliente.ccep,
      rua: cadCliente.clogradouro,
      Num: cadCliente.cnumero,
      complemento: cadCliente.ccomplemento,
      bairro: cadCliente.cbairro,
      cidade: cadCliente.ccidade,
      uf: cadCliente.cuf
    })
    await createCliente.save()
    //confirmação de cliente adicionado no banco
    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Cliente adicionado com sucesso",
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
        event.reply('reset-form')
      }
    })
  } catch (error) {
    //tratamento da escessão cpf duplicado
    if (error.code === 11000) {
      dialog.showMessageBox({
        type: 'error',
        title: "Atenção!",
        message: "CPF Já cadastrado.\nVerifique o número digitado",
        buttons: ['OK']
      }).them((result) => {
        //se o botão OK for pressionado
        if (result.response === 0) {
          //...
        }
      })

    } else {
      console.log(error)
    }
  }
})

// =================================================================
// == FIM CRUD Create ==============================================

//diaolog é uma caixa de mensagem que vem para confirmar depois de salvar os dados do cliente

//confirmação de cliente adicionado ao banco
//Uso de dialog
////* dialog.showMessageBox({
//montagem da caixa de mensagem
//  type: 'info',
//  title: "aviso",
//  message: "Cliente adicionado com sucesso",
//  buttons: ['OK']
//}).then((result) => {
//  //se o botção ok for pressionado
//  if(result.response === 0) {
//    //enviar um pedido para o renderizador limapr os campos atraves do //preload.js
// event.reply('reset-form')
// }
//}) 
