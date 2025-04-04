console.log("Electron - Processo principal")

//importação dos recursos do framework
//dialog modulo electron para ativar caixa de mensagens
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog,  } = require('electron/main')

// Ativação do preload.js (importtação do path)
const path = require('node:path')

//importação dos metodos conectar e desconectar
const { conectar, desconectar } = require('./database.js')



// Importação do modelo de dados (Notes.js)
const clientesModel = require('./src/models/Clientes.js')
const { title } = require('node:process')

//importação da biblioteca nativa do JS para manipular arquivos
const fs = require('fs')

//importação do pacote jspdf (arquivo pdf) npm
const { jspdf, default: jsPDF} = require('jspdf')

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
    let conectado = await conectar()
    if (conectado) {
      console.log("Banco conectado! Enviando status ao renderer.")
      // enviar ao renderizador uma mensagem para trocar a imagem do icone de status do banco de dados (criar um delay de 0.5 ou 1s para sincronização com a nuvem)
      setTimeout(() => {
        //enviar ao renderizador a mensagem "conectado"
        //db-status (IPC - comunicação entre processos - preload.js)
        //.replay encaminha mensagem 
        event.reply('db-status', "conectado")
      }, 500)
    } else {
      console.log("Falha na conexão com o banco.")
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
        label: 'Clientes',
        click: () => relatorioClientes()
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
    const newCliente = new clientesModel({
      nome: cadCliente.cadNome,
      nasc: cadCliente.cadNasc,
      email: cadCliente.cadEmail,
      cpf: cadCliente.cadCpf,
      cep: cadCliente.cadCep,
      rua: cadCliente.cadLogradouro,
      Num: cadCliente.cadNumero,
      complemento: cadCliente.cadComplemento,
      bairro: cadCliente.cadBairro,
      cidade: cadCliente.cadCidade,
      uf: cadCliente.cadUf
    
    })
    await newCliente.save()
   
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
       message: "CPF Já cadastrado.//\nVerifique o número digitado",
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

//=============================================================
//== Relatório de clientes ====================================
async function relatorioClientes(){
  try {
    //=======================================
    //        configuração do documento pdf
    //======================================
    //p (portrait [em pé]) l (landscape [deitado])
      const doc = new jsPDF('p', 'mm', 'a4')

      //inserir data atual
      const dataAtual = new Date().toLocaleDateString ('pt-BR')
      //doc.setFontSize() tamanho da fonte 
      doc.setFontSize(10)
      //doc.text() escreve um texto no documento criado acima
      doc.text(`Data: ${dataAtual}`, 170,15) //(150x,15y(mm))

      //titulo
      doc.setFontSize(18)
      doc.text("Relatório de Clientes", 15, 30)

      //conteudo
      doc.setFontSize(12)
      let y = 40 //variavel de apoio
      doc.text("Nome", 14, y)
     
      doc.text("E-Mail", 130, y)
      //incremento de +5 na variavel y para pular linha
      y += 5
      //desenhar uma linha
      doc.setLineWidth(0.5)
      doc.line(10, y, 200, y)
      y+=10
      //====================================fim
     
      //========================================
      // obter a listagem de clientes em ordem alfabética
      //========================================
      const clientes = await clientesModel.find().sort({nome: 1})
      //teste de recebimento (importante) pode deixar comentado depois de testar
      console.log(clientes)
      //popular o documento pdf com os clientes cadastrados
      //forEach(c) usa o laço for de "busca" e chama um argumento "c"
      clientes.forEach((c)=> {
        doc.text(c.nome, 15, y)
        doc.text(c.email, 130, y)
        y += 10
      });


    //====================================fim
    
    //==abrir o arquivo=======================
    //========================================

    //==abrir o arquivo pdf no sistema operacional
        //=======================================
      // Definir o caminho do arquivo temporário e nome do arquivo com extenção .pdf
      const tempDir = app.getPath('temp')
      const filePath = path.join(tempDir, 'clientes.pdf')
      // salvar temporariamente o arquivo
      doc.save(filePath)
      // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
      shell.openPath(filePath)
  } catch (error) {
      console.log(error)
  }
}

//=============================================================
//== Relatório de clientes - Fim ==============================



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
