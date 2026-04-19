const STORAGE_KEY = 'id';

const TIPOS_DESPESA = {
  1: 'Alimentacao',
  2: 'Educacao',
  3: 'Lazer',
  4: 'Saude',
  5: 'Transporte',
  6: 'Outros',
};

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
