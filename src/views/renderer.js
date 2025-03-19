/**
 * Renderer JS. Arquivo de reinderização do padrão do electron
 * Serve para comunicação com o processo principal
 * Processo de reinderização do documento index.html
 */

console.log("Processo de reinderização")

// inserção da data no rodapé
function obterData() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}

document.getElementById('dataAtual').innerHTML = obterData()



function buscarEndereco() {
    // Obtém o valor do CEP, removendo qualquer caractere não numérico
    var campoCEP = document.getElementById('cep')
    var mensagemErro = document.getElementById('cepErro');
    var cep = campoCEP.value.replace(/\D/g, '');

    // Verifica se o CEP tem 8 dígitos
    if (cep.length === 8) {
        var url = `https://viacep.com.br/ws/${cep}/json/`;

        // Faz a requisição ao ViaCEP
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    // CEP não encontrado na API
                    mensagemErro.style.display = 'inline'; // Exibe a mensagem de erro
                    campoCEP.value = ""; // Limpa o campo
                    campoCEP.focus(); // Retorna o foco para o campo do CEP
                } else {
                    // Preenche os campos com os dados retornados
                    document.getElementById('logradouro').value = data.logradouro;
                    document.getElementById('bairro').value = data.bairro;
                    document.getElementById('cidade').value = data.localidade;
                    document.getElementById('uf').value = data.uf;
                    mensagemErro.style.display = 'none'; // Oculta a mensagem de erro
                }
            })
            .catch(error => {
                mensagemErro.style.display = 'inline';
                campoCEP.value = ""; // Limpa o campo
                campoCEP.focus(); // Retorna o foco para o campo do CEP
            });
    } else {
       mensagemErro.style.display = 'inline';
       campoCEP.value = ""; // Limpa o campo
       campoCEP.focus(); // Retorna o foco para o campo do CEP
    }
}

function validarCPF() {
    var campo = document.getElementById('ccpf');
    var mensagemErro = document.getElementById('cpfErro');
    var strCPF = campo.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (!TestaCPF(strCPF)) {
        console.log("CPF inválido!");
        mensagemErro.style.display = 'inline'; // Exibe a mensagem de erro
        campo.value = ""; // Limpa o campo
        campo.focus(); // Volta o foco para o campo do CPF
        
        return false; // Retorna false para indicar que o CPF é inválido
    } else {
        console.log("CPF válido!");
        mensagemErro.style.display = 'none'; // Oculta a mensagem de erro
        return true; // Retorna true para indicar que o CPF é válido
    }
}

function TestaCPF(strCPF) {
    var Soma = 0;
    var Resto;

    if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false; // Verifica se são 11 dígitos e se não são repetidos

    for (var i = 1; i <= 9; i++) {
        Soma += parseInt(strCPF.charAt(i - 1)) * (11 - i);
    }
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(strCPF.charAt(9))) return false;

    Soma = 0;
    for (var i = 1; i <= 10; i++) {
        Soma += parseInt(strCPF.charAt(i - 1)) * (12 - i);
    }
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(strCPF.charAt(10))) return false;

    return true;
}


function TestaCPF(strCPF) {
    var Soma = 0;
    var Resto;

    if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false; // Verifica se são 11 dígitos e se não são repetidos

    for (var i = 1; i <= 9; i++) {
        Soma += parseInt(strCPF.charAt(i - 1)) * (11 - i);
    }
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(strCPF.charAt(9))) return false;

    Soma = 0;
    for (var i = 1; i <= 10; i++) {
        Soma += parseInt(strCPF.charAt(i - 1)) * (12 - i);
    }
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(strCPF.charAt(10))) return false;

    return true;
}