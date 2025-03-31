/**
 * Modelo de dados dos dados dos clientes
 * Criação da coleção
 */

// importação dos recursos do moongose
const {model, Schema} = require('mongoose')

//criação da estrutura da criação
const clienteSchema = new Schema({
    nome: {
        type: String
    },
    nasc:{
        type: String
    },
    email: {
        type: String
    },
    cpf: {
        type: String
    },
    cep: {
        type: String
    },
    rua: {
        type: String
    },
    Num: {
        type: String
    },
    complemento: {
        type: String
    },
    bairro: {
        type: String
    },
    cidade: {
        type: String
    },
    uf: {
        type: String
    }

}, {versionKey: false})

//exportar o modelo de dados para o main
module.exports = model('Clientes', clienteSchema)