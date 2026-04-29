const STORAGE_KEY = 'id';
const BANK_ACCOUNTS_KEY = 'monapp.bankAccounts';

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
  debito: 'Debito',
  credito: 'Credito',
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  alelo: 'Alelo',
  retirada: 'Retirada',
  deposito: 'Deposito',
};

const FORMAS_PAGAMENTO_META = {
  1: { label: 'Débito', icon: '↘', className: 'is-debito' },
  2: { label: 'Crédito', icon: '↗', className: 'is-credito' },
  3: { label: 'Pix', icon: '⚡', className: 'is-pix' },
  4: { label: 'Dinheiro', icon: '💵', className: 'is-dinheiro' },
  5: { label: 'Alelo', icon: '🍽', className: 'is-alelo' },
  debito: { label: 'Débito', icon: '↘', className: 'is-debito' },
  credito: { label: 'Crédito', icon: '↗', className: 'is-credito' },
  pix: { label: 'Pix', icon: '⚡', className: 'is-pix' },
  dinheiro: { label: 'Dinheiro', icon: '💵', className: 'is-dinheiro' },
  alelo: { label: 'Alelo', icon: '🍽', className: 'is-alelo' },
  retirada: { label: 'Retirada', icon: '➖', className: 'is-default' },
  deposito: { label: 'Depósito', icon: '➕', className: 'is-default' },
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

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

function safeParseList(rawValue) {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeMoney(value) {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0 : value;
  }

  const raw = String(value ?? '').trim();
  if (raw === '') return 0;

  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw.replace(/\s/g, '');

  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toMoneyString(value) {
  return normalizeMoney(value).toFixed(2);
}

function normalizeFormaPagamento(value) {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();

  if (raw === '1' || raw === 'debito' || raw === 'débito') return 'debito';
  if (raw === '2' || raw === 'credito' || raw === 'crédito') return 'credito';
  if (raw === '3' || raw === 'pix') return 'pix';
  if (raw === '4' || raw === 'dinheiro') return 'dinheiro';
  if (raw === '5' || raw === 'alelo') return 'alelo';
  if (raw === 'retirada') return 'retirada';
  if (raw === 'deposito' || raw === 'depósito') return 'deposito';

  return raw;
}

function monthKeyFromDate(value) {
  const date = value ? new Date(value) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split('-').map((part) => Number.parseInt(part, 10));
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
}

function parseBankAccounts() {
  const storage = getStorage();
  if (!storage) return [];

  return safeParseList(storage.getItem(BANK_ACCOUNTS_KEY)).map((conta) => ({
    id: String(conta.id),
    nome: String(conta.nome ?? '').trim(),
    saldoAtual: toMoneyString(conta.saldoAtual ?? conta.saldo ?? 0),
    faturaAtual: toMoneyString(conta.faturaAtual ?? 0),
    recebiveis: Array.isArray(conta.recebiveis)
      ? conta.recebiveis.map((recebivel) => ({
          id: String(recebivel.id),
          descricao: String(recebivel.descricao ?? '').trim(),
          valor: toMoneyString(recebivel.valor ?? 0),
          data: String(recebivel.data ?? ''),
        }))
      : [],
    saidas: Array.isArray(conta.saidas)
      ? conta.saidas.map((saida) => ({
          id: String(saida.id),
          descricao: String(saida.descricao ?? '').trim(),
          valor: toMoneyString(saida.valor ?? 0),
          data: String(saida.data ?? ''),
          categoria: String(saida.categoria ?? '').trim(),
          formaPagamento: String(saida.formaPagamento ?? '').trim(),
          parcelas: Number.parseInt(saida.parcelas ?? '1', 10) || 1,
          contaId: String(saida.contaId ?? ''),
        }))
      : [],
    faturasProjecao: Array.isArray(conta.faturasProjecao)
      ? conta.faturasProjecao.map((fatura) => ({
          mes: String(fatura.mes ?? ''),
          valor: toMoneyString(fatura.valor ?? 0),
        }))
      : [],
  }));
}

function salvarBankAccounts(contas) {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(BANK_ACCOUNTS_KEY, JSON.stringify(contas));
}

export function initBankAccountsStorage() {
  const storage = getStorage();
  if (!storage) return;

  if (storage.getItem(BANK_ACCOUNTS_KEY) === null) {
    storage.setItem(BANK_ACCOUNTS_KEY, '[]');
  }
}

export function recuperarContasBancarias() {
  initBankAccountsStorage();
  return parseBankAccounts();
}

export function obterContaBancariaPorId(contaId) {
  return recuperarContasBancarias().find((conta) => conta.id === String(contaId)) ?? null;
}

export function criarContaBancaria({ nome, saldoAtual = 0 }) {
  const contas = recuperarContasBancarias();
  const conta = {
    id: String(Date.now()),
    nome: String(nome ?? '').trim(),
    saldoAtual: toMoneyString(saldoAtual),
    faturaAtual: '0.00',
    recebiveis: [],
    saidas: [],
    faturasProjecao: [],
  };

  contas.push(conta);
  salvarBankAccounts(contas);
  return conta;
}

export function removerContaBancaria(contaId) {
  const contas = recuperarContasBancarias().filter((conta) => conta.id !== String(contaId));
  salvarBankAccounts(contas);
}

export function atualizarContaBancaria(contaId, updater) {
  const contas = recuperarContasBancarias().map((conta) => {
    if (conta.id !== String(contaId)) return conta;
    const updated = updater({ ...conta });
    return {
      ...conta,
      ...updated,
      saldoAtual: toMoneyString(updated.saldoAtual ?? conta.saldoAtual),
      faturaAtual: toMoneyString(updated.faturaAtual ?? conta.faturaAtual),
    };
  });

  salvarBankAccounts(contas);
}

export function registrarRecebivel(contaId, recebivel) {
  atualizarContaBancaria(contaId, (conta) => {
    const valorAdicionado = toMoneyString(recebivel.valor ?? 0);
    return {
      ...conta,
      saldoAtual: toMoneyString(
        Number.parseFloat(conta.saldoAtual) + Number.parseFloat(valorAdicionado),
      ),
      recebiveis: [
        ...(conta.recebiveis ?? []),
        {
          id: String(recebivel.id ?? Date.now()),
          descricao: String(recebivel.descricao ?? '').trim(),
          valor: valorAdicionado,
          data: String(recebivel.data ?? ''),
        },
      ],
    };
  });
}

export function removerRecebivel(contaId, recebivelId) {
  atualizarContaBancaria(contaId, (conta) => {
    const recebivel = (conta.recebiveis ?? []).find((r) => r.id === String(recebivelId));
    if (!recebivel) return conta;

    return {
      ...conta,
      saldoAtual: toMoneyString(
        Number.parseFloat(conta.saldoAtual) - Number.parseFloat(recebivel.valor),
      ),
      recebiveis: (conta.recebiveis ?? []).filter((r) => r.id !== String(recebivelId)),
    };
  });
}

export function removerSaida(contaId, saidaId) {
  atualizarContaBancaria(contaId, (conta) => {
    const saida = (conta.saidas ?? []).find((s) => s.id === String(saidaId));
    if (!saida) return conta;

    const novasSaidas = conta.saidas.filter((s) => s.id !== String(saidaId));
    const valorTotalSaida = Number.parseFloat(saida.valor);

    if (saida.formaPagamento === 'credito') {
      const parcelas = Math.max(Number.parseInt(saida.parcelas ?? '1', 10) || 1, 1);
      const mesReferencia = monthKeyFromDate(saida.data || undefined);
      const valorParcelaNum = Number.parseFloat(saida.valorParcela ?? 0);
      const faturasProjecao = [...(conta.faturasProjecao ?? [])];

      for (let indice = 0; indice < parcelas; indice += 1) {
        const mes = shiftMonthKey(mesReferencia, indice);
        const existente = faturasProjecao.find((fatura) => fatura.mes === mes);
        if (existente) {
          existente.valor = toMoneyString(
            Math.max(Number.parseFloat(existente.valor) - valorParcelaNum, 0),
          );
        }
      }

      return {
        ...conta,
        faturaAtual: toMoneyString(
          Math.max(Number.parseFloat(conta.faturaAtual) - valorParcelaNum, 0),
        ),
        saidas: novasSaidas,
        faturasProjecao,
      };
    }

    return {
      ...conta,
      saldoAtual: toMoneyString(Number.parseFloat(conta.saldoAtual) + valorTotalSaida),
      saidas: novasSaidas,
    };
  });
}

export function registrarSaida(contaId, saida) {
  const valorTotal = toMoneyString(saida.valor ?? 0);
  const formaPagamento = String(saida.formaPagamento ?? '').trim();
  const parcelas = Math.max(Number.parseInt(saida.parcelas ?? '1', 10) || 1, 1);
  const dataSaida = String(saida.data ?? '');
  const mesReferencia = monthKeyFromDate(dataSaida || undefined);

  atualizarContaBancaria(contaId, (conta) => {
    const saidaBase = {
      id: String(saida.id ?? Date.now()),
      descricao: String(saida.descricao ?? '').trim(),
      valor: valorTotal,
      data: dataSaida,
      categoria: String(saida.categoria ?? '').trim(),
      formaPagamento,
      parcelas,
      contaId: String(contaId),
    };

    if (formaPagamento === 'credito') {
      const valorParcela = toMoneyString(Number.parseFloat(valorTotal) / parcelas);
      const faturasProjecao = [...(conta.faturasProjecao ?? [])];

      for (let indice = 0; indice < parcelas; indice += 1) {
        const mes = shiftMonthKey(mesReferencia, indice);
        const existente = faturasProjecao.find((fatura) => fatura.mes === mes);
        if (existente) {
          existente.valor = toMoneyString(
            Number.parseFloat(existente.valor) + Number.parseFloat(valorParcela),
          );
        } else {
          faturasProjecao.push({ mes, valor: valorParcela });
        }
      }

      return {
        ...conta,
        faturaAtual: toMoneyString(
          Number.parseFloat(conta.faturaAtual) + Number.parseFloat(valorParcela),
        ),
        saidas: [...(conta.saidas ?? []), { ...saidaBase, valorParcela }],
        faturasProjecao,
      };
    }

    return {
      ...conta,
      saldoAtual: toMoneyString(
        Number.parseFloat(conta.saldoAtual) - Number.parseFloat(valorTotal),
      ),
      saidas: [...(conta.saidas ?? []), saidaBase],
    };
  });
}

export function listarProjecaoFaturas(contaId, quantidadeMeses = 6) {
  const conta = obterContaBancariaPorId(contaId);
  if (!conta) return [];

  const base = monthKeyFromDate();
  return Array.from({ length: quantidadeMeses }, (_, indice) => {
    const mes = shiftMonthKey(base, indice);
    const total = (conta.faturasProjecao ?? [])
      .filter((fatura) => fatura.mes === mes)
      .reduce((sum, fatura) => sum + Number.parseFloat(fatura.valor), 0);

    return { mes, total };
  });
}

export function initStorage() {
  const storage = getStorage();
  if (!storage) return;

  if (storage.getItem(STORAGE_KEY) === null) {
    storage.setItem(STORAGE_KEY, '0');
  }
}

export function createDespesa(data) {
  return {
    ano: String(data.ano ?? '').trim(),
    mes: String(data.mes ?? '').trim(),
    dia: String(data.dia ?? '').trim(),
    tipo: String(data.tipo ?? '').trim(),
    formaPagamento: normalizeFormaPagamento(data.formaPagamento),
    contaBancaria: String(data.contaBancaria ?? '').trim(),
    tipoMovimento: String(data.tipoMovimento ?? 'saida').trim(),
    descricao: String(data.descricao ?? '').trim(),
    valor: String(data.valor ?? '').trim(),
  };
}

export function validarDespesa(despesa) {
  return Object.values(despesa).every((value) => value !== '' && value != null);
}

export function getProximoId() {
  const storage = getStorage();
  const atual = storage?.getItem(STORAGE_KEY) ?? '0';
  return Number.parseInt(atual, 10) + 1;
}

export function gravarDespesa(despesa) {
  const id = getProximoId();
  const storage = getStorage();
  if (!storage) return id;

  storage.setItem(String(id), JSON.stringify(despesa));
  storage.setItem(STORAGE_KEY, String(id));
  return id;
}

export function recuperarTodasDespesas() {
  const despesas = [];
  const storage = getStorage();
  if (!storage) return despesas;

  const idMax = Number.parseInt(storage.getItem(STORAGE_KEY) ?? '0', 10);

  for (let i = 0; i <= idMax; i += 1) {
    const item = storage.getItem(String(i));
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
    lista = lista.filter(
      (d) =>
        normalizeFormaPagamento(d.formaPagamento) ===
        normalizeFormaPagamento(filtro.formaPagamento),
    );
  if (filtro.contaBancaria) lista = lista.filter((d) => d.contaBancaria === filtro.contaBancaria);
  if (filtro.tipoMovimento)
    lista = lista.filter((d) => (d.tipoMovimento ?? 'saida') === filtro.tipoMovimento);

  if (filtro.descricao) {
    const termo = filtro.descricao.toLowerCase();
    lista = lista.filter((d) => d.descricao.toLowerCase().includes(termo));
  }

  if (filtro.valor) lista = lista.filter((d) => d.valor === filtro.valor);

  return lista;
}

export function removerDespesa(id) {
  const storage = getStorage();
  if (!storage) return;

  const raw = storage.getItem(String(id));
  if (raw) {
    try {
      const despesa = JSON.parse(raw);
      if (despesa.contaBancaria && despesa.valor && despesa.descricao) {
        const contas = recuperarContasBancarias();
        const contasAtualizadas = contas.map((conta) => {
          if (conta.id !== String(despesa.contaBancaria)) return conta;

          const valorAlvo = toMoneyString(despesa.valor);
          if (despesa.tipoMovimento === 'entrada') {
            const index = conta.recebiveis.findIndex(
              (r) => r.descricao === despesa.descricao && toMoneyString(r.valor) === valorAlvo,
            );
            if (index !== -1) {
              const r = [...conta.recebiveis];
              r.splice(index, 1);
              return { ...conta, recebiveis: r };
            }
          } else {
            const index = conta.saidas.findIndex(
              (s) => s.descricao === despesa.descricao && toMoneyString(s.valor) === valorAlvo,
            );
            if (index !== -1) {
              const s = [...conta.saidas];
              s.splice(index, 1);
              return { ...conta, saidas: s };
            }
          }
          return conta;
        });
        salvarBankAccounts(contasAtualizadas);
      }
    } catch {
      // ignora erro silenciosamente
    }
  }

  storage.removeItem(String(id));
}

export function formatarTipo(tipo) {
  return TIPOS_DESPESA[tipo] ?? tipo;
}

export function formatarFormaPagamento(formaPagamento) {
  const normalized = normalizeFormaPagamento(formaPagamento);
  return FORMAS_PAGAMENTO[normalized] ?? formaPagamento;
}

export function obterFormaPagamentoInfo(formaPagamento) {
  const normalized = normalizeFormaPagamento(formaPagamento);
  return (
    FORMAS_PAGAMENTO_META[normalized] ?? {
      label: formatarFormaPagamento(normalized),
      icon: '•',
      className: 'is-default',
    }
  );
}

export function gerarDespesasFicticias(quantidade = 24) {
  initStorage();
  initBankAccountsStorage();

  const anos = [String(new Date().getFullYear() - 1), String(new Date().getFullYear())];
  const tipos = Object.keys(TIPOS_DESPESA);
  const formasSaida = ['debito', 'credito', 'pix', 'alelo', 'retirada'];
  const contas = recuperarContasBancarias();

  if (contas.length === 0) {
    criarContaBancaria({ nome: 'Conta Principal', saldoAtual: '5000' });
    criarContaBancaria({ nome: 'Conta Reserva', saldoAtual: '3000' });
  }

  const contasAtualizadas = recuperarContasBancarias();

  for (let i = 0; i < quantidade; i += 1) {
    const dia = String(randomInt(1, 28));
    const mes = String(randomInt(1, 12));
    const valor = (randomInt(1500, 45000) / 100).toFixed(2).replace('.', ',');
    const tipoMovimento = randomItem(['entrada', 'saida']);
    const formaPagamento = tipoMovimento === 'entrada' ? 'deposito' : randomItem(formasSaida);
    const contaSelecionada = randomItem(contasAtualizadas);
    const idConta = contaSelecionada?.id ?? '';
    const descricao = randomItem(DESCRICOES_FICTICIAS);

    const idDespesa = gravarDespesa({
      ano: randomItem(anos),
      mes,
      dia,
      tipo: randomItem(tipos),
      formaPagamento,
      contaBancaria: idConta,
      tipoMovimento,
      descricao,
      valor,
    });

    if (idConta) {
      if (tipoMovimento === 'entrada') {
        registrarRecebivel(idConta, {
          id: String(idDespesa),
          descricao,
          valor,
          data: `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`,
        });
      } else {
        registrarSaida(idConta, {
          id: String(idDespesa),
          descricao,
          valor,
          data: `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`,
          categoria: randomItem(tipos),
          formaPagamento,
          parcelas: 1,
        });
      }
    }
  }

  return quantidade;
}

export function limparDespesas() {
  const storage = getStorage();
  if (!storage) return;

  const idMax = Number.parseInt(storage.getItem(STORAGE_KEY) ?? '0', 10);

  for (let i = 0; i <= idMax; i += 1) {
    storage.removeItem(String(i));
  }

  storage.setItem(STORAGE_KEY, '0');

  const contas = recuperarContasBancarias();
  const contasLimpas = contas.map((conta) => ({
    ...conta,
    faturaAtual: '0.00',
    recebiveis: [],
    saidas: [],
    faturasProjecao: [],
  }));
  salvarBankAccounts(contasLimpas);
}
