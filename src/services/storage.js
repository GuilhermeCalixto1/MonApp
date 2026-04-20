const STORAGE_KEY = 'id';

const TIPOS_DESPESA = {
  1: 'Alimentacao',
  2: 'Educacao',
  3: 'Lazer',
  4: 'Saude',
  5: 'Transporte',
  6: 'Outros',
};

const FORMAS_PAGAMENTO = {
  1: 'Debito',
  2: 'Credito',
  3: 'Pix',
  4: 'Dinheiro',
  5: 'Alelo',
};

const FORMAS_PAGAMENTO_META = {
  1: { label: 'Débito', icon: '↘', className: 'is-debito' },
  2: { label: 'Crédito', icon: '↗', className: 'is-credito' },
  3: { label: 'Pix', icon: '⚡', className: 'is-pix' },
  4: { label: 'Dinheiro', icon: '💵', className: 'is-dinheiro' },
  5: { label: 'Alelo', icon: '🍽', className: 'is-alelo' },
};

const DESCRICOES_FICTICIAS = [
  'Almoco no restaurante',
  'Curso online',
  'Cinema no fim de semana',
  'Farmacia e remedios',
  'Combustivel',
  'Mercado do mes',
  'Assinatura de streaming',
  'Manutencao do carro',
  'Lanche da tarde',
  'Material de estudo',
  'Presente para amigo',
  'Taxi para reuniao',
];

function randomItem(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function initStorage() {
  if (localStorage.getItem(STORAGE_KEY) === null) {
    localStorage.setItem(STORAGE_KEY, '0');
  }
}

export function createDespesa(data) {
  return {
    ano: String(data.ano ?? '').trim(),
    mes: String(data.mes ?? '').trim(),
    dia: String(data.dia ?? '').trim(),
    tipo: String(data.tipo ?? '').trim(),
    formaPagamento: String(data.formaPagamento ?? '').trim(),
    descricao: String(data.descricao ?? '').trim(),
    valor: String(data.valor ?? '').trim(),
  };
}

export function validarDespesa(despesa) {
  return Object.values(despesa).every((value) => value !== '' && value != null);
}

export function getProximoId() {
  const atual = localStorage.getItem(STORAGE_KEY) ?? '0';
  return Number.parseInt(atual, 10) + 1;
}

export function gravarDespesa(despesa) {
  const id = getProximoId();
  localStorage.setItem(String(id), JSON.stringify(despesa));
  localStorage.setItem(STORAGE_KEY, String(id));
}

export function recuperarTodasDespesas() {
  const despesas = [];
  const idMax = Number.parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);

  for (let i = 0; i <= idMax; i += 1) {
    const item = localStorage.getItem(String(i));
    if (!item) continue;

    const despesa = JSON.parse(item);
    despesas.push({ ...despesa, id: i });
  }

  return despesas;
}

export function pesquisarDespesas(filtro) {
  let lista = recuperarTodasDespesas();

  if (filtro.ano) lista = lista.filter((d) => d.ano === filtro.ano);
  if (filtro.mes) lista = lista.filter((d) => d.mes === filtro.mes);
  if (filtro.dia) lista = lista.filter((d) => d.dia === filtro.dia);
  if (filtro.tipo) lista = lista.filter((d) => d.tipo === filtro.tipo);
  if (filtro.formaPagamento)
    lista = lista.filter((d) => d.formaPagamento === filtro.formaPagamento);

  if (filtro.descricao) {
    const termo = filtro.descricao.toLowerCase();
    lista = lista.filter((d) => d.descricao.toLowerCase().includes(termo));
  }

  if (filtro.valor) lista = lista.filter((d) => d.valor === filtro.valor);

  return lista;
}

export function removerDespesa(id) {
  localStorage.removeItem(String(id));
}

export function formatarTipo(tipo) {
  return TIPOS_DESPESA[tipo] ?? tipo;
}

export function formatarFormaPagamento(formaPagamento) {
  return FORMAS_PAGAMENTO[formaPagamento] ?? formaPagamento;
}

export function obterFormaPagamentoInfo(formaPagamento) {
  return (
    FORMAS_PAGAMENTO_META[formaPagamento] ?? {
      label: formaPagamento,
      icon: '•',
      className: 'is-default',
    }
  );
}

export function gerarDespesasFicticias(quantidade = 24) {
  initStorage();

  const anos = [String(new Date().getFullYear() - 1), String(new Date().getFullYear())];
  const tipos = Object.keys(TIPOS_DESPESA);
  const formas = Object.keys(FORMAS_PAGAMENTO);

  for (let i = 0; i < quantidade; i += 1) {
    const dia = String(randomInt(1, 28));
    const mes = String(randomInt(1, 12));
    const valor = (randomInt(1500, 45000) / 100).toFixed(2).replace('.', ',');

    gravarDespesa({
      ano: randomItem(anos),
      mes,
      dia,
      tipo: randomItem(tipos),
      formaPagamento: randomItem(formas),
      descricao: randomItem(DESCRICOES_FICTICIAS),
      valor,
    });
  }

  return quantidade;
}

export function limparDespesas() {
  const idMax = Number.parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);

  for (let i = 0; i <= idMax; i += 1) {
    localStorage.removeItem(String(i));
  }

  localStorage.setItem(STORAGE_KEY, '0');
}
