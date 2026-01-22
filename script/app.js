/* ==========================================================
   SEÇÃO 1: REFERÊNCIAS AO DOM
   ========================================================== */
const ano = document.getElementById('ano')
const mes = document.getElementById('mes')
const dia = document.getElementById('dia')
const tipo = document.getElementById('tipo')
const descricao = document.getElementById('descricao')
const valor = document.getElementById('valor')
const btnCadastro = document.getElementById('btnCadastro')
const tabela = document.getElementById('tabela')
const btnPesquisar = document.getElementById('btnPesquisar')

/* ==========================================================
   SEÇÃO 2: CLASSE DESPESA (MODELO)
   ========================================================== */
class Despesa {
    constructor(ano, mes, dia, tipo, descricao, valor) {
        this.ano = ano
        this.mes = mes
        this.dia = dia
        this.tipo = tipo
        this.descricao = descricao
        this.valor = valor
    }

    validarDados() {
        for (let i in this) {
            if (this[i] == undefined || this[i] == '' || this[i] == null) {
                return false
            }
        }
        return true
    }
}

/* ==========================================================
   SEÇÃO 3: BANCO DE DADOS (LOCALSTORAGE)
   ========================================================== */
function getProximoId() {
    let proximoId = localStorage.getItem('id')
    return proximoId === null ? 0 : parseInt(proximoId) + 1
}

function gravar(d) {
    let id = getProximoId()
    localStorage.setItem(id, JSON.stringify(d))
    localStorage.setItem('id', id)
}

/* ==========================================================
   SEÇÃO 4: CONTROLLER (LÓGICA DA TELA)
   ========================================================== */
   
  if (btnPesquisar) {
    btnPesquisar.addEventListener('click',function(){
      let id = localStorage.getItem('id');
      let arrayObjeto= []
      
      
      for(i=0;i<=id;i++){
    let objetoString = localStorage.getItem(i)
    if(objetoString != null){
    let objetoPronto = JSON.parse(objetoString)
    arrayObjeto.push(objetoPronto)
      }}
      console.log(arrayObjeto)
  })
  }
  
function estiloModal(tipoModal) {
    const titulo = document.getElementById('exampleModalLabel')
    const botao = document.getElementById('botaoModal')
    const corpo = document.getElementById('modalCampo')

    // Verifica se os elementos do modal existem antes de tentar alterar
    if (titulo && botao && corpo) {
        if (tipoModal === true) {
            titulo.className = 'modal-title fs-5 text-success'
            titulo.innerHTML = 'Sucesso!'
            botao.className = 'btn-success btn'
            botao.innerHTML = 'Fechar'
            corpo.innerHTML = 'Cadastro efetuado com sucesso!'
        } else {
            titulo.className = 'modal-title fs-5 text-danger'
            titulo.innerHTML = 'Erro na gravação'
            botao.className = 'btn-danger btn'
            botao.innerHTML = 'Voltar e corrigir'
            corpo.innerHTML = 'Existem campos que precisam sem preenchidos!'
        }
    }
}

function limparCampos() {
    ano.value = ''
    mes.value = ''
    dia.value = ''
    tipo.value = ''
    descricao.value = ''
    valor.value = ''
}

function renderizarConsulta() {
    // Verifica se estamos na página de consulta (se a tabela existe)
    if (tabela) {
        // 1. Array para guardar as despesas recuperadas
        let despesas = []
        let id = localStorage.getItem('id')

        // 2. Percorrer todos os IDs gravados no LocalStorage
        for(let i = 0; i <= id; i++) {
            // Recuperar a despesa convertendo de JSON para Objeto
            let despesa = JSON.parse(localStorage.getItem(i))

            // Pular índices que foram pulados/removidos (são null)
            if(despesa === null) {
                continue
            }
            
            // Adiciona a despesa válida no array
            despesas.push(despesa)
        }

        // 3. Limpar o conteúdo atual da tabela (tira o texto de exemplo se tiver)
        tabela.innerHTML = ''

        // 4. Percorrer o array e criar as linhas na tela
        despesas.forEach(function(d) {
            
            // Cria uma nova linha (tr) dentro do tbody
            let linha = tabela.insertRow()

            // Cria as colunas (td)
            // Coluna 0: Data
            linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`
            
            // Coluna 1: Tipo
            // Vamos converter o número (ex: "1") para o nome (ex: "Alimentação")
            switch(d.tipo){
                case '1': d.tipo = 'Alimentação'; break
                case '2': d.tipo = 'Educação'; break
                case '3': d.tipo = 'Lazer'; break
                case '4': d.tipo = 'Saúde'; break
                case '5': d.tipo = 'Transporte'; break
            }
            linha.insertCell(1).innerHTML = d.tipo
            
            // Coluna 2: Descrição
            linha.insertCell(2).innerHTML = d.descricao
            
            // Coluna 3: Valor
            linha.insertCell(3).innerHTML = d.valor
        })
    }
}

function cadastrarDespesa() {
    let despesa = new Despesa(
        ano.value,
        mes.value,
        dia.value,
        tipo.value,
        descricao.value,
        valor.value
    )

    if (despesa.validarDados()) {
        gravar(despesa)
        
        // Renderizar consulta não é necessário na tela de cadastro, mas se tiver a função, ok.
        renderizarConsulta() 
        
        estiloModal(true)
        $('#modalGravacao').modal('show')
        limparCampos()
    } else {
        estiloModal(false)
        $('#modalGravacao').modal('show')
    }
}

/* ==========================================================
   SEÇÃO 5: EVENTOS
   ========================================================== */
// Correção do erro de "addEventListener null":
// Verifica se o botão existe antes de adicionar o click
if (btnCadastro) {
    btnCadastro.addEventListener('click', () => {
        cadastrarDespesa()
    })
}

renderizarConsulta()
