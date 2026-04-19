import { useMemo, useState } from 'react';
import {
  createDespesa,
  formatarTipo,
  initStorage,
  pesquisarDespesas,
  recuperarTodasDespesas,
  removerDespesa,
} from '../services/storage';

initStorage();

const initialFiltro = {
  ano: '',
  mes: '',
  dia: '',
  tipo: '',
  descricao: '',
  valor: '',
};

export default function Consulta() {
  const [filtro, setFiltro] = useState(initialFiltro);
  const [despesas, setDespesas] = useState(() => recuperarTodasDespesas());
  const anos = useMemo(() => {
    const atual = new Date().getFullYear();
    return [atual - 1, atual, atual + 1];
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFiltro((prev) => ({ ...prev, [name]: value }));
  };

  const handlePesquisar = () => {
    const filtroNormalizado = createDespesa(filtro);
    setDespesas(pesquisarDespesas(filtroNormalizado));
  };

  const handleLimpar = () => {
    setFiltro(initialFiltro);
    setDespesas(recuperarTodasDespesas());
  };

  const handleRemover = (id) => {
    removerDespesa(id);
    setDespesas((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <main className="synth-page">
      <div className="synth-page__bg synth-page__bg--left" />
      <div className="synth-page__bg synth-page__bg--right" />
      <div className="synth-page__bg synth-page__grid" />

      <section className="synth-shell container-fluid">
        <div className="synth-shell__frame">
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

              <div className="synth-field">
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
                </select>
              </div>

              <div className="synth-field synth-field--wide">
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

              <div className="synth-field">
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

              <div className="synth-actions">
                <button type="button" className="synth-button synth-button--primary" onClick={handlePesquisar}>
                  Pesquisar
                </button>

                <button type="button" className="synth-button synth-button--secondary" onClick={handleLimpar}>
                  Limpar filtros
                </button>
              </div>
            </div>
          </div>

          <div className="synth-card synth-card--results">
            <div className="synth-table-wrap">
              <table className="synth-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descricao</th>
                    <th>Valor</th>
                    <th className="synth-table__actions" />
                  </tr>
                </thead>

                <tbody>
                  {despesas.length === 0 && (
                    <tr>
                      <td className="synth-table__empty" colSpan={5}>
                        Nenhuma despesa encontrada para os filtros informados.
                      </td>
                    </tr>
                  )}

                  {despesas.map((despesa) => (
                    <tr key={despesa.id}>
                      <td>{`${despesa.dia}/${despesa.mes}/${despesa.ano}`}</td>
                      <td>{formatarTipo(despesa.tipo)}</td>
                      <td>{despesa.descricao}</td>
                      <td>{`R$ ${despesa.valor}`}</td>
                      <td className="synth-table__actions">
                        <button
                          type="button"
                          className="synth-button synth-button--danger"
                          onClick={() => handleRemover(despesa.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
