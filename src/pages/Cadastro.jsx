import { useMemo, useState } from 'react';
import Modal from '../components/Modal';
import { createDespesa, gravarDespesa, initStorage, validarDespesa } from '../services/storage';

initStorage();

const initialForm = {
  ano: '',
  mes: '',
  dia: '',
  tipo: '',
  formaPagamento: '',
  descricao: '',
  valor: '',
};

export default function Cadastro() {
  const [form, setForm] = useState(initialForm);
  const [modal, setModal] = useState({
    show: false,
    success: false,
    title: '',
    message: '',
    buttonText: '',
  });

  const anos = useMemo(() => {
    const atual = new Date().getFullYear();
    return [atual - 1, atual, atual + 1];
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCadastrar = () => {
    const despesa = createDespesa(form);

    if (validarDespesa(despesa)) {
      gravarDespesa(despesa);
      setForm(initialForm);
      setModal({
        show: true,
        success: true,
        title: 'Sucesso!',
        message: 'Cadastro efetuado com sucesso!',
        buttonText: 'Fechar',
      });
      return;
    }

    setModal({
      show: true,
      success: false,
      title: 'Erro na gravacao',
      message: 'Existem campos vazios!',
      buttonText: 'Voltar e corrigir',
    });
  };

  return (
    <main className="synth-page">
      <div className="synth-page__bg synth-page__bg--left" />
      <div className="synth-page__bg synth-page__bg--right" />
      <div className="synth-page__bg synth-page__grid" />

      <section className="synth-shell container-fluid">
        <div className="synth-shell__frame">
          <header className="synth-hero">
            <h1 className="synth-title">Adicionar nova despesa</h1>
            <p className="synth-hero__subtitle">
              Preencha os campos abaixo para registrar um novo gasto.
            </p>
          </header>

          <div className="synth-card">
            <div className="synth-card__inner">
              <div className="synth-field synth-field--wide">
                <label className="synth-label" htmlFor="tipo">
                  Tipo
                </label>
                <select
                  id="tipo"
                  className="synth-control synth-control--select"
                  name="tipo"
                  value={form.tipo}
                  onChange={onChange}
                >
                  <option value="">Selecionar tipo</option>
                  <option value="1">Alimentacao</option>
                  <option value="2">Educacao</option>
                  <option value="3">Lazer</option>
                  <option value="4">Saude</option>
                  <option value="5">Transporte</option>
                  <option value="6">Outros</option>
                </select>
              </div>

              <div className="synth-field synth-field--wide">
                <label className="synth-label" htmlFor="formaPagamento">
                  Forma de pagamento
                </label>
                <select
                  id="formaPagamento"
                  className="synth-control synth-control--select"
                  name="formaPagamento"
                  value={form.formaPagamento}
                  onChange={onChange}
                >
                  <option value="">Selecionar forma de pagamento</option>
                  <option value="1">Débito</option>
                  <option value="2">Crédito</option>
                  <option value="3">Pix</option>
                  <option value="4">Dinheiro</option>
                  <option value="5">Alelo</option>
                </select>
              </div>

              <div className="synth-field synth-field--wide">
                <label className="synth-label" htmlFor="descricao">
                  Descricao
                </label>
                <textarea
                  id="descricao"
                  className="synth-control synth-control--textarea synth-control--textarea-compact"
                  placeholder="Ex: Almoço no restaurante neon..."
                  name="descricao"
                  value={form.descricao}
                  onChange={onChange}
                  rows="1"
                />
              </div>

              <div className="synth-field">
                <label className="synth-label">Data</label>
                <div className="synth-date-grid">
                  <select className="synth-control" name="dia" value={form.dia} onChange={onChange}>
                    <option value="">Dia</option>
                    {Array.from({ length: 31 }, (_, index) => String(index + 1)).map((dia) => (
                      <option key={dia} value={dia}>
                        {dia.padStart(2, '0')}
                      </option>
                    ))}
                  </select>

                  <select className="synth-control" name="mes" value={form.mes} onChange={onChange}>
                    <option value="">Mes</option>
                    <option value="1">01</option>
                    <option value="2">02</option>
                    <option value="3">03</option>
                    <option value="4">04</option>
                    <option value="5">05</option>
                    <option value="6">06</option>
                    <option value="7">07</option>
                    <option value="8">08</option>
                    <option value="9">09</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </select>

                  <select className="synth-control" name="ano" value={form.ano} onChange={onChange}>
                    <option value="">Ano</option>
                    {anos.map((ano) => (
                      <option key={ano} value={String(ano)}>
                        {ano}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="synth-field">
                <label className="synth-label" htmlFor="valor">
                  Valor
                </label>
                <div className="synth-money">
                  <span className="synth-money__prefix">R$</span>
                  <input
                    id="valor"
                    type="text"
                    className="synth-control synth-control--money"
                    placeholder="75,50"
                    name="valor"
                    value={form.valor}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="synth-actions">
                <button
                  type="button"
                  className="synth-button synth-button--primary"
                  onClick={handleCadastrar}
                >
                  Salvar despesa
                </button>

                <button
                  type="button"
                  className="synth-button synth-button--secondary"
                  onClick={() => setForm(initialForm)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        show={modal.show}
        success={modal.success}
        title={modal.title}
        message={modal.message}
        buttonText={modal.buttonText}
        onClose={() => setModal((prev) => ({ ...prev, show: false }))}
      />
    </main>
  );
}
