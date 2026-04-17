/* =================================================================================
   SEÇÃO 1: MODELO (O que é uma Despesa?)
   ================================================================================= */
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

/* =================================================================================
   SEÇÃO 2: BANCO DE DADOS (Tudo que toca no LocalStorage)
   ================================================================================= */
class Bd {
    constructor() {
        let id = localStorage.getItem('id')
        if (id === null) {
            localStorage.setItem('id', 0)
        }
    }

    getProximoId() {
        let proximoId = localStorage.getItem('id')
        return parseInt(proximoId) + 1
    }

    gravar(d) {
        let id = this.getProximoId()
        localStorage.setItem(id, JSON.stringify(d))
        localStorage.setItem('id', id)
    }

    recuperarTodosRegistros() {
        let despesas = []
        let id = localStorage.getItem('id')

        for (let i = 0; i <= id; i++) {
            let despesa = JSON.parse(localStorage.getItem(i))
            if (despesa === null) continue
            
            despesa.id = i
            despesas.push(despesa)
        }
        return despesas
    }

    pesquisar(despesaFiltro) {
        let despesasFiltradas = this.recuperarTodosRegistros()

        // Aplica os filtros apenas se o campo tiver valor
        if (despesaFiltro.ano != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.ano == despesaFiltro.ano)
        }
        if (despesaFiltro.mes != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.mes == despesaFiltro.mes)
        }
        if (despesaFiltro.dia != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.dia == despesaFiltro.dia)
        }
        if (despesaFiltro.tipo != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.tipo == despesaFiltro.tipo)
        }
        if (despesaFiltro.descricao != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.descricao.toLowerCase().includes(despesaFiltro.descricao.toLowerCase()))
        }
        if (despesaFiltro.valor != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.valor == despesaFiltro.valor)
        }

        return despesasFiltradas
    }

    remover(id) {
        localStorage.removeItem(id)
        // Não recarregamos a página aqui para deixar a responsabilidade visual para a UI
    }
}

// Instanciamos o banco de dados para usar nos eventos
let bd = new Bd()

/* =================================================================================
   SEÇÃO 3: INTERFACE DE USUÁRIO (Tudo que mexe na tela/DOM)
   ================================================================================= */
class Ui {
    
    // Método auxiliar para pegar valores do HTML sem poluir o escopo global
    getValoresFormulario() {
        return {
            ano: document.getElementById('ano'),
            mes: document.getElementById('mes'),
            dia: document.getElementById('dia'),
            tipo: document.getElementById('tipo'),
            descricao: document.getElementById('descricao'),
            valor: document.getElementById('valor')
        }
    }

    cadastrar() {
        const campos = this.getValoresFormulario()
        
        let despesa = new Despesa(
            campos.ano.value,
            campos.mes.value,
            campos.dia.value,
            campos.tipo.value,
            campos.descricao.value,
            campos.valor.value
        )

        if (despesa.validarDados()) {
            bd.gravar(despesa)
            this.exibirModal(true)
            this.limparCampos(campos)
        } else {
            this.exibirModal(false)
        }
    }

    carregarLista(despesas = Array(), filtro = false) {
        if (despesas.length == 0 && filtro == false) {
            despesas = bd.recuperarTodosRegistros()
        }

        const tabela = document.getElementById('tabela')
        tabela.innerHTML = ''

        despesas.forEach((d) => {
            let linha = tabela.insertRow()

            linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`
            
            // Ajuste do tipo
            switch (d.tipo) {
                case '1': d.tipo = 'Alimentação'; break
                case '2': d.tipo = 'Educação'; break
                case '3': d.tipo = 'Lazer'; break
                case '4': d.tipo = 'Saúde'; break
                case '5': d.tipo = 'Transporte'; break
            }
            linha.insertCell(1).innerHTML = d.tipo
            linha.insertCell(2).innerHTML = d.descricao
            linha.insertCell(3).innerHTML = d.valor

            // Botão de excluir
            this.criarBotaoExclusao(linha, d.id)
        })
    }

    criarBotaoExclusao(linha, id) {
        let btn = document.createElement('button')
        btn.className = "btn btn-danger"
        btn.innerHTML = '<i class="fas fa-times"></i>'
        btn.id = id
        btn.onclick = () => {
            bd.remover(id)
            window.location.reload()
        }
        linha.insertCell(4).append(btn)
    }

    pesquisarDespesas() {
        const campos = this.getValoresFormulario()
        
        let despesaBusca = new Despesa(
            campos.ano.value, 
            campos.mes.value, 
            campos.dia.value, 
            campos.tipo.value, 
            campos.descricao.value, 
            campos.valor.value
        )

        let despesasFiltradas = bd.pesquisar(despesaBusca)
        this.carregarLista(despesasFiltradas, true)
    }

    limparCampos(campos) {
        // Se não passar os campos, pega novamente
        if(!campos) campos = this.getValoresFormulario()
            
        campos.ano.value = ''
        campos.mes.value = ''
        campos.dia.value = ''
        campos.tipo.value = ''
        campos.descricao.value = ''
        campos.valor.value = ''
    }

    exibirModal(sucesso) {
        const titulo = document.getElementById('exampleModalLabel')
        const botao = document.getElementById('botaoModal')
        const corpo = document.getElementById('modalCampo')

        if (sucesso) {
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
            corpo.innerHTML = 'Existem campos vazios!'
        }
        $('#modalGravacao').modal('show')
    }
}

// Instanciamos a UI para usar nos eventos
let ui = new Ui()

/* =================================================================================
   SEÇÃO 4: EVENTOS (Gatilhos de cliques e carregamento)
   ================================================================================= */

// 1. Carregamento da página (se estiver na tela de consulta)
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tabela')) {
        ui.carregarLista()
    }
})

// 2. Botão de Cadastro
const btnCadastro = document.getElementById('btnCadastro')
if (btnCadastro) {
    btnCadastro.addEventListener('click', () => {
        ui.cadastrar()
    })
}

// 3. Botão de Pesquisa
const btnPesquisar = document.getElementById('btnPesquisar')
if (btnPesquisar) {
    btnPesquisar.addEventListener('click', () => {
        ui.pesquisarDespesas()
    })
}