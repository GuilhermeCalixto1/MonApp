import { useMemo, useState } from 'react';
import {
  createDespesa,
  formatarTipo,
  gerarDespesasFicticias,
  initBankAccountsStorage,
  initStorage,
  limparDespesas,
  obterFormaPagamentoInfo,
  pesquisarDespesas,
  recuperarContasBancarias,
  recuperarTodasDespesas,
  removerDespesa,
} from '../services/storage';

initStorage();
initBankAccountsStorage();

const initialFiltro = {
  ano: '',
  mes: '',
  dia: '',
  tipo: '',
  formaPagamento: '',
  contaBancaria: '',
  tipoMovimento: 'saida',
  descricao: '',
  valor: '',
};

const FORMAS_SAIDA = [
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
  { value: 'pix', label: 'Pix' },
  { value: 'alelo', label: 'Alelo' },
  { value: 'retirada', label: 'Retirada' },
];

const FORMAS_ENTRADA = [{ value: 'deposito', label: 'Depósito' }];

function FormaPagamentoIcon({ formaPagamento }) {
  switch (formaPagamento) {
    case '1':
    case 'debito':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="4" y="6" width="16" height="12" rx="2.5" fill="currentColor" opacity="0.16" />
          <rect
            x="4.5"
            y="6.5"
            width="15"
            height="11"
            rx="2.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M7 9h10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 15V5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M9.3 7.8 12 5.1l2.7 2.7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case '2':
    case 'credito':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="4" y="6" width="16" height="12" rx="2.5" fill="currentColor" opacity="0.16" />
          <rect
            x="4.5"
            y="6.5"
            width="15"
            height="11"
            rx="2.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M7 9h10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 8.5v10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M9.3 16.2 12 18.9l2.7-2.7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case '3':
    case 'pix':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.16" />
          <path d="M13.4 3.8 5.5 13h5.1l-1 7.2L18.5 11h-5z" fill="currentColor" />
        </svg>
      );
    case '4':
    case 'dinheiro':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect
            x="3.5"
            y="6.5"
            width="17"
            height="11"
            rx="2.5"
            fill="currentColor"
            opacity="0.16"
          />
          <rect
            x="4"
            y="7"
            width="16"
            height="10"
            rx="2.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6.5 10.2h11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M6.5 13.8h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="17.2" cy="13.4" r="1.1" fill="currentColor" />
        </svg>
      );
    case '5':
    case 'alelo':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect
            x="3.5"
            y="6.5"
            width="17"
            height="11"
            rx="2.5"
            fill="currentColor"
            opacity="0.16"
          />
          <rect
            x="4"
            y="7"
            width="16"
            height="10"
            rx="2.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 10.5c0-1.2 1-2.2 2.2-2.2h3.4c1.2 0 2.2 1 2.2 2.2s-1 2.2-2.2 2.2h-3.4C9 12.7 8 11.7 8 10.5Z"
            fill="currentColor"
          />
          <path d="M11 9.3v2.4" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M9.8 10.5h2.4"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'retirada':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.16" />
          <path
            d="M7 12h10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'deposito':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.16" />
          <path
            d="M12 7v10M7 12h10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
}

export default function Consulta() {
  const [filtro, setFiltro] = useState(initialFiltro);
  const [despesas, setDespesas] = useState(() => recuperarTodasDespesas());
  const [visibleCards, setVisibleCards] = useState(6);
  const [contas] = useState(() => recuperarContasBancarias());
  const formaPagamentoLabel =
    filtro.tipoMovimento === 'entrada' ? 'Forma de entrada' : 'Forma de saída';

  const anos = useMemo(() => {
    const atual = new Date().getFullYear();
    return [atual - 1, atual, atual + 1];
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFiltro((prev) => ({ ...prev, [name]: value }));
  };

  const handlePesquisar = () => {
    const filtroNormalizado = {
      ...createDespesa(filtro),
      tipoMovimento: String(filtro.tipoMovimento ?? '').trim(),
    };
    setDespesas(pesquisarDespesas(filtroNormalizado));
    setVisibleCards(6);
  };

  const contaPorId = useMemo(() => {
    return contas.reduce((acc, conta) => {
      acc[conta.id] = conta.nome;
      return acc;
    }, {});
  }, [contas]);

  const getContaNome = (contaId) => contaPorId[contaId] ?? 'Sem conta';

  const getTipoMovimentoLabel = (tipoMovimento) =>
    tipoMovimento === 'entrada' ? 'Entrada' : 'Saida';

  const formasMovimento = useMemo(() => {
    if (filtro.tipoMovimento === 'entrada') return FORMAS_ENTRADA;
    if (filtro.tipoMovimento === 'saida') return FORMAS_SAIDA;
    return [...FORMAS_ENTRADA, ...FORMAS_SAIDA];
  }, [filtro.tipoMovimento]);

  const handleLimpar = () => {
    setFiltro(initialFiltro);
    setDespesas(recuperarTodasDespesas());
    setVisibleCards(6);
  };

  const handleRemover = (id) => {
    removerDespesa(id);
    setDespesas((prev) => prev.filter((d) => d.id !== id));
  };

  const handleGerarFicticias = () => {
    gerarDespesasFicticias(30);
    setFiltro(initialFiltro);
    setDespesas(recuperarTodasDespesas());
    setVisibleCards(6);
  };

  const handleLimparDadosTeste = () => {
    limparDespesas();
    setFiltro(initialFiltro);
    setDespesas([]);
    setVisibleCards(6);
  };

  const handleVerMais = () => {
    setVisibleCards((prev) => Math.min(prev + 6, despesas.length));
  };

  const remainingCards = despesas.length - visibleCards;
  const isFinalStep = remainingCards > 0 && remainingCards <= 6;

  return (
    <main className="synth-page synth-consulta">
      <div className="synth-page__bg synth-page__bg--left" />
      <div className="synth-page__bg synth-page__bg--right" />
      <div className="synth-page__bg synth-page__grid" />

      <section className="synth-shell container-fluid">
        <div className="synth-shell__frame synth-consulta__frame">
          <header className="synth-hero">
            <h1 className="synth-title">Consultar despesas</h1>
            <p className="synth-hero__subtitle">Filtre, revise e remova registros existentes.</p>
          </header>

          <div className="synth-card">
            <div className="synth-card__inner">
              <div className="synth-field">
                <label className="synth-label" htmlFor="ano">
                  Ano
                </label>
                <select
                  id="ano"
                  className="synth-control synth-control--select"
                  name="ano"
                  value={filtro.ano}
                  onChange={onChange}
                >
                  <option value="">Todos</option>
                  {anos.map((ano) => (
                    <option key={ano} value={String(ano)}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              <div className="synth-field">
                <label className="synth-label" htmlFor="mes">
                  Mes
                </label>
                <select
                  id="mes"
                  className="synth-control synth-control--select"
                  name="mes"
                  value={filtro.mes}
                  onChange={onChange}
                >
                  <option value="">Todos</option>
                  <option value="1">Janeiro</option>
                  <option value="2">Fevereiro</option>
                  <option value="3">Marco</option>
                  <option value="4">Abril</option>
                  <option value="5">Maio</option>
                  <option value="6">Junho</option>
                  <option value="7">Julho</option>
                  <option value="8">Agosto</option>
                  <option value="9">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </div>

              <div className="synth-field synth-consulta__desktop-filter">
                <label className="synth-label" htmlFor="dia">
                  Dia
                </label>
                <select
                  id="dia"
                  className="synth-control synth-control--select"
                  name="dia"
                  value={filtro.dia}
                  onChange={onChange}
                >
                  <option value="">Todos</option>
                  {Array.from({ length: 31 }, (_, index) => String(index + 1)).map((dia) => (
                    <option key={dia} value={dia}>
                      {dia.padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="synth-field">
                <label className="synth-label" htmlFor="tipo">
                  Tipo
                </label>
                <select
                  id="tipo"
                  className="synth-control synth-control--select"
                  name="tipo"
                  value={filtro.tipo}
                  onChange={onChange}
                >
                  <option value="">Todos</option>
                  <option value="1">Alimentacao</option>
                  <option value="2">Educacao</option>
                  <option value="3">Lazer</option>
                  <option value="4">Saude</option>
                  <option value="5">Transporte</option>
                  <option value="6">Outros</option>
                </select>
              </div>

              <div className="synth-field synth-consulta__desktop-filter">
                <label className="synth-label" htmlFor="formaPagamento">
                  {formaPagamentoLabel}
                </label>
                <select
                  id="formaPagamento"
                  className="synth-control synth-control--select"
                  name="formaPagamento"
                  value={filtro.formaPagamento}
                  onChange={onChange}
                >
                  <option value="">Todos</option>
                  {formasMovimento.map((forma) => (
                    <option key={forma.value} value={forma.value}>
                      {forma.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="synth-field synth-consulta__desktop-filter">
                <label className="synth-label" htmlFor="contaBancaria">
                  Conta bancária
                </label>
                <select
                  id="contaBancaria"
                  className="synth-control synth-control--select"
                  name="contaBancaria"
                  value={filtro.contaBancaria}
                  onChange={onChange}
                >
                  <option value="">Todas</option>
                  {contas.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="synth-field synth-consulta__desktop-filter">
                <label className="synth-label" htmlFor="tipoMovimento">
                  Movimento
                </label>
                <select
                  id="tipoMovimento"
                  className="synth-control synth-control--select"
                  name="tipoMovimento"
                  value={filtro.tipoMovimento}
                  onChange={onChange}
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div className="synth-field synth-field--wide synth-consulta__desktop-filter">
                <label className="synth-label" htmlFor="descricao">
                  Descricao
                </label>
                <input
                  id="descricao"
                  type="text"
                  className="synth-control"
                  placeholder="Buscar por descricao"
                  name="descricao"
                  value={filtro.descricao}
                  onChange={onChange}
                />
              </div>

              <div className="synth-field synth-consulta__desktop-filter">
                <label className="synth-label" htmlFor="valor">
                  Valor
                </label>
                <input
                  id="valor"
                  type="text"
                  className="synth-control"
                  placeholder="Ex: 120,00"
                  name="valor"
                  value={filtro.valor}
                  onChange={onChange}
                />
              </div>

              <div className="synth-actions synth-consulta__actions">
                <button
                  type="button"
                  className="synth-button synth-button--primary"
                  onClick={handlePesquisar}
                >
                  Pesquisar
                </button>

                <button
                  type="button"
                  className="synth-button synth-button--secondary"
                  onClick={handleLimpar}
                >
                  Limpar filtros
                </button>

                <button
                  type="button"
                  className="synth-button synth-button--utility synth-actions__full"
                  onClick={handleGerarFicticias}
                >
                  Gerar dados fictícios
                </button>

                <button
                  type="button"
                  className="synth-button synth-button--danger-soft synth-actions__full"
                  onClick={handleLimparDadosTeste}
                >
                  Limpar dados de teste
                </button>
              </div>
            </div>
          </div>

          <div className="synth-card synth-card--results">
            <div className="synth-table-wrap synth-consulta__desktop-table synth-consulta__table-wrap">
              <table className="synth-table synth-consulta__table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Conta</th>
                    <th>Movimento</th>
                    <th>Tipo</th>
                    <th>Forma de saída</th>
                    <th>Descricao</th>
                    <th>Valor</th>
                    <th className="synth-table__actions" />
                  </tr>
                </thead>

                <tbody>
                  {despesas.length === 0 && (
                    <tr>
                      <td className="synth-table__empty" colSpan={8}>
                        Nenhuma despesa encontrada para os filtros informados.
                      </td>
                    </tr>
                  )}

                  {despesas.slice(0, visibleCards).map((despesa) => {
                    const pagamento = obterFormaPagamentoInfo(despesa.formaPagamento);

                    return (
                      <tr key={despesa.id}>
                        <td data-label="Data">{`${despesa.dia}/${despesa.mes}/${despesa.ano}`}</td>
                        <td data-label="Conta">{getContaNome(despesa.contaBancaria)}</td>
                        <td data-label="Movimento">
                          {getTipoMovimentoLabel(despesa.tipoMovimento)}
                        </td>
                        <td data-label="Tipo">{formatarTipo(despesa.tipo)}</td>
                        <td data-label="Pagamento">
                          <span className={`synth-payment-badge ${pagamento.className}`}>
                            <span className="synth-payment-badge__icon" aria-hidden="true">
                              <FormaPagamentoIcon formaPagamento={despesa.formaPagamento} />
                            </span>
                            <span>{pagamento.label}</span>
                          </span>
                        </td>
                        <td data-label="Descricao">{despesa.descricao}</td>
                        <td data-label="Valor">{`R$ ${despesa.valor}`}</td>
                        <td data-label="Acao" className="synth-table__actions">
                          <button
                            type="button"
                            className="synth-button synth-button--danger"
                            onClick={() => handleRemover(despesa.id)}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {visibleCards < despesas.length && (
              <div className="synth-consulta__desktop-more-wrap">
                <button
                  type="button"
                  className="synth-button synth-button--secondary synth-consulta__desktop-more"
                  onClick={() => {
                    if (isFinalStep) {
                      setVisibleCards(despesas.length);
                      return;
                    }

                    handleVerMais();
                  }}
                >
                  {isFinalStep ? 'Mostrar todos' : 'Ver mais'}
                </button>
              </div>
            )}

            <div className="synth-consulta__mobile-list">
              {despesas.length === 0 ? (
                <div className="synth-consulta__mobile-empty">
                  Nenhuma despesa encontrada para os filtros informados.
                </div>
              ) : (
                <>
                  <div className="synth-consulta__mobile-cards">
                    {despesas.slice(0, visibleCards).map((despesa) => {
                      const pagamento = obterFormaPagamentoInfo(despesa.formaPagamento);

                      return (
                        <article
                          key={`mobile-${despesa.id}`}
                          className="synth-consulta__mobile-card"
                        >
                          <div className="synth-consulta__mobile-card-head">
                            <div className="synth-consulta__mobile-date">{`${despesa.dia}/${despesa.mes}/${despesa.ano}`}</div>
                            <button
                              type="button"
                              className="synth-button synth-button--danger synth-consulta__mobile-delete"
                              onClick={() => handleRemover(despesa.id)}
                            >
                              Excluir
                            </button>
                          </div>

                          <div className="synth-consulta__mobile-meta">
                            <span className="synth-consulta__mobile-label">Conta</span>
                            <strong>{getContaNome(despesa.contaBancaria)}</strong>
                          </div>

                          <div className="synth-consulta__mobile-meta">
                            <span className="synth-consulta__mobile-label">Movimento</span>
                            <strong>{getTipoMovimentoLabel(despesa.tipoMovimento)}</strong>
                          </div>

                          <div className="synth-consulta__mobile-meta">
                            <span className="synth-consulta__mobile-label">Tipo</span>
                            <strong>{formatarTipo(despesa.tipo)}</strong>
                          </div>

                          <div className="synth-consulta__mobile-meta">
                            <span className="synth-consulta__mobile-label">Pagamento</span>
                            <span className={`synth-payment-badge ${pagamento.className}`}>
                              <span className="synth-payment-badge__icon" aria-hidden="true">
                                <FormaPagamentoIcon formaPagamento={despesa.formaPagamento} />
                              </span>
                              <span>{pagamento.label}</span>
                            </span>
                          </div>

                          <div className="synth-consulta__mobile-meta synth-consulta__mobile-meta--stacked">
                            <span className="synth-consulta__mobile-label">Descricao</span>
                            <span>{despesa.descricao}</span>
                          </div>

                          <div className="synth-consulta__mobile-meta">
                            <span className="synth-consulta__mobile-label">Valor</span>
                            <strong>{`R$ ${despesa.valor}`}</strong>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {visibleCards < despesas.length && (
                    <div className="synth-consulta__mobile-more-wrap">
                      <button
                        type="button"
                        className="synth-button synth-button--secondary synth-consulta__mobile-more"
                        onClick={() => {
                          if (isFinalStep) {
                            setVisibleCards(despesas.length);
                            return;
                          }

                          handleVerMais();
                        }}
                      >
                        {isFinalStep ? 'Mostrar todos' : 'Ver mais'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
