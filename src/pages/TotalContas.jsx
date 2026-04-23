import { useMemo, useState } from 'react';
import {
  criarContaBancaria,
  initBankAccountsStorage,
  recuperarContasBancarias,
  atualizarContaBancaria,
  registrarRecebivel,
  registrarSaida,
  removerContaBancaria,
  removerRecebivel,
  removerSaida,
} from '../services/storage';

const CATEGORIAS = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Outros'];

const FORMAS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Cartão de Crédito' },
  { value: 'retirada', label: 'Retirada' },
];

function parseMoney(value) {
  if (typeof value === 'number') return value;
  const raw = String(value ?? '').trim();
  if (raw === '') return 0;

  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw.replace(/\s/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatMoney(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map((part) => Number.parseInt(part, 10));
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

function monthKeysAhead(count = 6) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
}

function ProjectionChart({ points }) {
  const maxValue = Math.max(...points.map((point) => point.total), 0) || 1;

  return (
    <div
      className="synth-total__svg-chart"
      role="img"
      aria-label="Projeção das faturas para os próximos 6 meses"
    >
      <div className="synth-total__svg-chart-bars">
        {points.map((point) => {
          const heightPercent = (point.total / maxValue) * 100;

          return (
            <div key={point.label} className="synth-total__svg-chart-bar-group">
              <strong className="synth-total__svg-chart-value">{formatMoney(point.total)}</strong>
              <div className="synth-total__svg-chart-bar-wrap">
                <div
                  className="synth-total__svg-chart-bar"
                  style={{ height: `${Math.max(heightPercent, point.total > 0 ? 6 : 0)}%` }}
                  title={`${point.label}: ${formatMoney(point.total)}`}
                />
              </div>
              <span className="synth-total__svg-chart-month">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function createEmptyAccountForm() {
  return { nome: '', saldoAtual: '' };
}

function createEmptyReceivableForm(contaId = '') {
  return { contaId, descricao: '', valor: '', data: '' };
}

function createEmptyOutflowForm(contaId = '') {
  return {
    contaId,
    descricao: '',
    valor: '',
    data: '',
    categoria: '',
    formaPagamento: 'debito',
    parcelas: '1',
  };
}

function createEmptyBalanceForm(contaId = '', saldoAtual = '') {
  return { contaId, saldoAtual };
}

function Modal({ open, title, subtitle, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="synth-account-modal__backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="synth-account-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="synth-account-modal__head">
          <div>
            <h2 className="synth-account-modal__title">{title}</h2>
            {subtitle ? <p className="synth-account-modal__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="synth-account-modal__close" onClick={onClose}>
            Fechar
          </button>
        </div>
        <div className="synth-account-modal__body">{children}</div>
        {footer ? <div className="synth-account-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export default function TotalContas() {
  const [bankAccounts, setBankAccounts] = useState(() => {
    initBankAccountsStorage();
    return recuperarContasBancarias();
  });
  const [accountError, setAccountError] = useState('');
  const [accountForm, setAccountForm] = useState(createEmptyAccountForm());
  const [receivableForm, setReceivableForm] = useState(createEmptyReceivableForm());
  const [outflowForm, setOutflowForm] = useState(createEmptyOutflowForm());
  const [balanceForm, setBalanceForm] = useState(createEmptyBalanceForm());
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [receivableModalOpen, setReceivableModalOpen] = useState(false);
  const [outflowModalOpen, setOutflowModalOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);

  const todayIso = useMemo(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }, []);

  const refreshAccounts = () => setBankAccounts(recuperarContasBancarias());

  const totalSaldo = useMemo(
    () => bankAccounts.reduce((sum, conta) => sum + parseMoney(conta.saldoAtual), 0),
    [bankAccounts],
  );

  const totalFaturas = useMemo(
    () => bankAccounts.reduce((sum, conta) => sum + parseMoney(conta.faturaAtual), 0),
    [bankAccounts],
  );

  const projectionMonths = useMemo(() => monthKeysAhead(6), []);

  const totalProjectionPoints = useMemo(() => {
    return projectionMonths.map((mes) => {
      const total = bankAccounts.reduce((acc, conta) => {
        const projeccao = Array.isArray(conta.faturasProjecao) ? conta.faturasProjecao : [];
        const totalConta = projeccao
          .filter((item) => item.mes === mes)
          .reduce((sum, item) => sum + parseMoney(item.valor), 0);
        return acc + totalConta;
      }, 0);
      return {
        mes,
        label: formatMonthLabel(mes),
        total,
      };
    });
  }, [bankAccounts, projectionMonths]);

  const projectionByAccount = useMemo(() => {
    return bankAccounts.map((conta) => {
      const points = projectionMonths.map((mes) => {
        const total = (conta.faturasProjecao ?? [])
          .filter((item) => item.mes === mes)
          .reduce((sum, item) => sum + parseMoney(item.valor), 0);

        return {
          mes,
          label: formatMonthLabel(mes),
          total,
        };
      });

      const totalProjetado = points.reduce((sum, point) => sum + point.total, 0);

      return {
        id: conta.id,
        nome: conta.nome,
        points,
        totalProjetado,
      };
    });
  }, [bankAccounts, projectionMonths]);

  const openAccountModal = () => {
    setAccountForm(createEmptyAccountForm());
    setAccountError('');
    setAccountModalOpen(true);
  };

  const handleCreateAccount = () => {
    if (!accountForm.nome.trim() || !accountForm.saldoAtual.trim()) {
      setAccountError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    criarContaBancaria({
      nome: accountForm.nome,
      saldoAtual: accountForm.saldoAtual,
    });

    refreshAccounts();
    setAccountForm(createEmptyAccountForm());
    setAccountError('');
    setAccountModalOpen(false);
  };

  const openReceivableModal = (contaId) => {
    setReceivableForm(createEmptyReceivableForm(contaId));
    setReceivableModalOpen(true);
  };

  const handleCreateReceivable = () => {
    if (
      !receivableForm.contaId ||
      !receivableForm.descricao.trim() ||
      !receivableForm.valor.trim()
    ) {
      return;
    }

    if (receivableForm.data && receivableForm.data > todayIso) {
      return;
    }

    registrarRecebivel(receivableForm.contaId, {
      id: `${Date.now()}`,
      descricao: receivableForm.descricao,
      valor: receivableForm.valor,
      data: receivableForm.data,
    });
    refreshAccounts();
    setReceivableForm(createEmptyReceivableForm());
    setReceivableModalOpen(false);
  };

  const openOutflowModal = (contaId) => {
    setOutflowForm(createEmptyOutflowForm(contaId));
    setOutflowModalOpen(true);
  };

  const openBalanceModal = (conta) => {
    setBalanceForm(createEmptyBalanceForm(conta.id, conta.saldoAtual));
    setBalanceModalOpen(true);
  };

  const handleUpdateBalance = () => {
    if (!balanceForm.contaId || !balanceForm.saldoAtual.trim()) return;

    atualizarContaBancaria(balanceForm.contaId, (conta) => ({
      ...conta,
      saldoAtual: balanceForm.saldoAtual,
    }));

    refreshAccounts();
    setBalanceForm(createEmptyBalanceForm());
    setBalanceModalOpen(false);
  };

  const handleCreateOutflow = () => {
    if (
      !outflowForm.contaId ||
      !outflowForm.descricao.trim() ||
      !outflowForm.valor.trim() ||
      !outflowForm.data.trim() ||
      !outflowForm.categoria.trim() ||
      !outflowForm.formaPagamento.trim()
    ) {
      return;
    }

    if (outflowForm.data > todayIso) {
      return;
    }

    registrarSaida(outflowForm.contaId, {
      id: `${Date.now()}`,
      descricao: outflowForm.descricao,
      valor: outflowForm.valor,
      data: outflowForm.data,
      categoria: outflowForm.categoria,
      formaPagamento: outflowForm.formaPagamento,
      parcelas: outflowForm.formaPagamento === 'credito' ? outflowForm.parcelas : '1',
    });
    refreshAccounts();
    setOutflowForm(createEmptyOutflowForm());
    setOutflowModalOpen(false);
  };

  const handleRemoveAccount = (contaId) => {
    removerContaBancaria(contaId);
    refreshAccounts();
  };

  const creditFormVisible = outflowForm.formaPagamento === 'credito';

  return (
    <main className="synth-page synth-total">
      <div className="synth-page__bg synth-page__bg--left" />
      <div className="synth-page__bg synth-page__bg--right" />
      <div className="synth-page__bg synth-page__grid" />

      <section className="synth-shell container-fluid">
        <div className="synth-shell__frame synth-total__frame">
          <header className="synth-hero synth-total__hero">
            <h1 className="synth-title">Contas bancárias</h1>
            <p className="synth-hero__subtitle">
              Cards com saldo atual, fatura do cartão, recebíveis e lançamentos de saída.
            </p>
          </header>

          <div className="synth-total__toolbar">
            <button
              type="button"
              className="synth-button synth-button--primary"
              onClick={openAccountModal}
            >
              Adicionar Conta
            </button>
            <p className="synth-total__toolbar-note">
              Saldo total atual: <strong>{formatMoney(totalSaldo)}</strong>
            </p>
          </div>

          <div className="synth-total__cards-grid">
            {bankAccounts.length === 0 ? (
              <article className="synth-total__empty-state">
                <h2 className="synth-total__empty-title">Nenhuma conta cadastrada</h2>
                <p className="synth-total__empty-text">
                  Clique em “Adicionar Conta” para começar a organizar seus saldos e recebíveis.
                </p>
              </article>
            ) : (
              bankAccounts.map((conta) => {
                return (
                  <article key={conta.id} className="synth-total__account-card">
                    <div className="synth-total__account-head">
                      <div>
                        <p className="synth-total__account-label">Conta bancária</p>
                        <h2 className="synth-total__account-name">{conta.nome}</h2>
                      </div>
                      <button
                        type="button"
                        className="synth-button synth-button--danger-soft"
                        onClick={() => handleRemoveAccount(conta.id)}
                      >
                        Remover Conta
                      </button>
                    </div>

                    <div className="synth-total__account-grid">
                      <div className="synth-total__account-metric">
                        <span>Saldo atual</span>
                        <strong>{formatMoney(conta.saldoAtual)}</strong>
                      </div>

                      <div className="synth-total__account-metric">
                        <span>Fatura Atual do Cartão</span>
                        <strong>{formatMoney(conta.faturaAtual)}</strong>
                      </div>
                    </div>

                    <div className="synth-total__account-actions">
                      <button
                        type="button"
                        className="synth-button synth-button--secondary"
                        onClick={() => openReceivableModal(conta.id)}
                      >
                        Cadastrar Entrada
                      </button>
                      <button
                        type="button"
                        className="synth-button synth-button--primary"
                        onClick={() => openOutflowModal(conta.id)}
                      >
                        Cadastrar Saída
                      </button>
                      <button
                        type="button"
                        className="synth-button synth-button--secondary"
                        onClick={() => openBalanceModal(conta)}
                      >
                        Editar Saldo
                      </button>
                    </div>

                    <div className="synth-total__mini-list">
                      <div className="synth-total__mini-list-head">Últimas entradas</div>
                      {(conta.recebiveis ?? []).length === 0 ? (
                        <p className="synth-total__mini-empty">Nenhuma entrada nesta conta.</p>
                      ) : (
                        (conta.recebiveis ?? [])
                          .slice(-5)
                          .reverse()
                          .map((item) => (
                            <div key={item.id} className="synth-total__mini-row">
                              <span>{item.descricao}</span>
                              <div className="synth-total__mini-row-actions">
                                <strong>{formatMoney(item.valor)}</strong>
                                <button
                                  type="button"
                                  className="synth-total__mini-remove"
                                  onClick={() => {
                                    removerRecebivel(conta.id, item.id);
                                    refreshAccounts();
                                  }}
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>

                    <div className="synth-total__mini-list">
                      <div className="synth-total__mini-list-head">Últimas saídas</div>
                      {(conta.saidas ?? []).length === 0 ? (
                        <p className="synth-total__mini-empty">Nenhuma saída nesta conta.</p>
                      ) : (
                        (conta.saidas ?? [])
                          .slice(-5)
                          .reverse()
                          .map((saida) => (
                            <div key={saida.id} className="synth-total__mini-row">
                              <span>
                                {saida.descricao}
                                {saida.data ? ` - ${saida.data}` : ''}
                              </span>
                              <div className="synth-total__mini-row-actions">
                                <strong>{formatMoney(saida.valor)}</strong>
                                <button
                                  type="button"
                                  className="synth-total__mini-remove"
                                  onClick={() => {
                                    removerSaida(conta.id, saida.id);
                                    refreshAccounts();
                                  }}
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <section className="synth-total__chart-shell synth-total__chart-shell--total">
            <div className="synth-total__chart-head">
              <h2 className="synth-total__chart-title">Projeção de faturas total</h2>
              <p className="synth-total__chart-subtitle">
                Consolidação de todas as contas para os próximos 6 meses.
              </p>
            </div>
            <div className="synth-total__chart-wrap">
              <ProjectionChart points={totalProjectionPoints} />
            </div>
          </section>

          {projectionByAccount.length > 0 ? (
            <section className="synth-total__projections-grid">
              {projectionByAccount.map((projection) => (
                <article
                  key={projection.id}
                  className="synth-total__chart-shell synth-total__chart-shell--account"
                >
                  <div className="synth-total__chart-head">
                    <h3 className="synth-total__chart-title">Projeção: {projection.nome}</h3>
                    <p className="synth-total__chart-subtitle">
                      Total projetado: {formatMoney(projection.totalProjetado)}
                    </p>
                  </div>
                  <div className="synth-total__chart-wrap synth-total__chart-wrap--account">
                    <ProjectionChart points={projection.points} />
                  </div>
                </article>
              ))}
            </section>
          ) : null}

          <footer className="synth-total__footer">
            <div>
              <p className="synth-total__footer-label">Saldo Total</p>
              <p className="synth-total__footer-value">{formatMoney(totalSaldo)}</p>
            </div>
            <div className="synth-total__footer-meta">
              <span>Fatura atual consolidada</span>
              <strong>{formatMoney(totalFaturas)}</strong>
            </div>
          </footer>
        </div>
      </section>

      <Modal
        open={accountModalOpen}
        title="Adicionar Conta"
        subtitle="Cadastre a conta bancária que será usada nos lançamentos."
        onClose={() => setAccountModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="synth-button synth-button--secondary"
              onClick={() => setAccountModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="synth-button synth-button--primary"
              onClick={handleCreateAccount}
            >
              Salvar Conta
            </button>
          </>
        }
      >
        <div className="synth-total__modal-grid">
          {accountError && (
            <div
              style={{
                gridColumn: '1 / -1',
                color: '#ff4b4b',
                backgroundColor: 'rgba(255, 75, 75, 0.1)',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                border: '1px solid #ff4b4b',
                marginBottom: '10px',
                fontWeight: 'bold',
              }}
            >
              ⚠️ {accountError}
            </div>
          )}
          <label className="synth-field">
            <span className="synth-label">Nome da conta</span>
            <input
              type="text"
              className="synth-control"
              style={accountError && !accountForm.nome.trim() ? { borderColor: '#ff4b4b' } : {}}
              value={accountForm.nome}
              onChange={(event) => {
                setAccountForm((prev) => ({ ...prev, nome: event.target.value }));
                if (accountError) setAccountError('');
              }}
              placeholder="Ex: Nubank"
            />
          </label>
          <label className="synth-field">
            <span className="synth-label">Saldo inicial</span>
            <input
              type="text"
              className="synth-control"
              style={
                accountError && !accountForm.saldoAtual.trim() ? { borderColor: '#ff4b4b' } : {}
              }
              value={accountForm.saldoAtual}
              onChange={(event) => {
                setAccountForm((prev) => ({ ...prev, saldoAtual: event.target.value }));
                if (accountError) setAccountError('');
              }}
              placeholder="Ex: 1500,00"
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={receivableModalOpen}
        title="Cadastrar Entrada"
        subtitle="Registre um valor que ainda vai entrar nesta conta."
        onClose={() => setReceivableModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="synth-button synth-button--secondary"
              onClick={() => setReceivableModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="synth-button synth-button--primary"
              onClick={handleCreateReceivable}
            >
              Salvar Entrada
            </button>
          </>
        }
      >
        <div className="synth-total__modal-grid">
          <label className="synth-field synth-field--wide">
            <span className="synth-label">Conta bancária</span>
            <select
              className="synth-control synth-control--select"
              value={receivableForm.contaId}
              onChange={(event) =>
                setReceivableForm((prev) => ({ ...prev, contaId: event.target.value }))
              }
            >
              <option value="">Selecione uma conta</option>
              {bankAccounts.map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="synth-field synth-field--wide">
            <span className="synth-label">Descrição</span>
            <input
              type="text"
              className="synth-control"
              value={receivableForm.descricao}
              onChange={(event) =>
                setReceivableForm((prev) => ({ ...prev, descricao: event.target.value }))
              }
              placeholder="Ex: Salário, freelancer, comissão..."
            />
          </label>
          <label className="synth-field">
            <span className="synth-label">Valor</span>
            <input
              type="text"
              className="synth-control"
              value={receivableForm.valor}
              onChange={(event) =>
                setReceivableForm((prev) => ({ ...prev, valor: event.target.value }))
              }
              placeholder="Ex: 3200,00"
            />
          </label>
          <label className="synth-field">
            <span className="synth-label">Data</span>
            <input
              type="date"
              className="synth-control synth-control--date"
              value={receivableForm.data}
              max={todayIso}
              onChange={(event) =>
                setReceivableForm((prev) => ({ ...prev, data: event.target.value }))
              }
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={outflowModalOpen}
        title="Cadastrar Saída"
        subtitle="Lançamento direto com conta bancária pré-selecionada e opção de parcelamento."
        onClose={() => setOutflowModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="synth-button synth-button--secondary"
              onClick={() => setOutflowModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="synth-button synth-button--primary"
              onClick={handleCreateOutflow}
            >
              Salvar Saída
            </button>
          </>
        }
      >
        <div className="synth-total__modal-grid">
          <label className="synth-field synth-field--wide">
            <span className="synth-label">Conta bancária</span>
            <select
              className="synth-control synth-control--select"
              value={outflowForm.contaId}
              onChange={(event) =>
                setOutflowForm((prev) => ({ ...prev, contaId: event.target.value }))
              }
            >
              <option value="">Selecione uma conta</option>
              {bankAccounts.map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="synth-field synth-field--wide">
            <span className="synth-label">Descrição</span>
            <input
              type="text"
              className="synth-control"
              value={outflowForm.descricao}
              onChange={(event) =>
                setOutflowForm((prev) => ({ ...prev, descricao: event.target.value }))
              }
              placeholder="Ex: Internet, mercado, combustível..."
            />
          </label>
          <label className="synth-field">
            <span className="synth-label">Valor</span>
            <input
              type="text"
              className="synth-control"
              value={outflowForm.valor}
              onChange={(event) =>
                setOutflowForm((prev) => ({ ...prev, valor: event.target.value }))
              }
              placeholder="Ex: 250,00"
            />
          </label>
          <label className="synth-field">
            <span className="synth-label">Data</span>
            <input
              type="date"
              className="synth-control"
              value={outflowForm.data}
              max={todayIso}
              onChange={(event) =>
                setOutflowForm((prev) => ({ ...prev, data: event.target.value }))
              }
            />
          </label>
          <label className="synth-field">
            <span className="synth-label">Categoria</span>
            <select
              className="synth-control synth-control--select"
              value={outflowForm.categoria}
              onChange={(event) =>
                setOutflowForm((prev) => ({ ...prev, categoria: event.target.value }))
              }
            >
              <option value="">Selecione</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </label>
          <label className="synth-field">
            <span className="synth-label">Forma de saída</span>
            <select
              className="synth-control synth-control--select"
              value={outflowForm.formaPagamento}
              onChange={(event) =>
                setOutflowForm((prev) => ({
                  ...prev,
                  formaPagamento: event.target.value,
                  parcelas: event.target.value === 'credito' ? prev.parcelas : '1',
                }))
              }
            >
              {FORMAS_PAGAMENTO.map((forma) => (
                <option key={forma.value} value={forma.value}>
                  {forma.label}
                </option>
              ))}
            </select>
          </label>

          {creditFormVisible ? (
            <label className="synth-field synth-field--wide">
              <span className="synth-label">Quantidade de Parcelas</span>
              <input
                type="number"
                min="1"
                className="synth-control"
                value={outflowForm.parcelas}
                onChange={(event) =>
                  setOutflowForm((prev) => ({ ...prev, parcelas: event.target.value }))
                }
              />
            </label>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={balanceModalOpen}
        title="Editar Saldo"
        subtitle="Atualize o saldo atual da conta selecionada."
        onClose={() => setBalanceModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="synth-button synth-button--secondary"
              onClick={() => setBalanceModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="synth-button synth-button--primary"
              onClick={handleUpdateBalance}
            >
              Salvar Saldo
            </button>
          </>
        }
      >
        <div className="synth-total__modal-grid">
          <label className="synth-field synth-field--wide">
            <span className="synth-label">Novo saldo</span>
            <input
              type="text"
              className="synth-control"
              value={balanceForm.saldoAtual}
              onChange={(event) =>
                setBalanceForm((prev) => ({ ...prev, saldoAtual: event.target.value }))
              }
              placeholder="Ex: 1500,00"
            />
          </label>
        </div>
      </Modal>
    </main>
  );
}
