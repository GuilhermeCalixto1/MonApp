import { Link } from 'react-router-dom';

export default function Inicio() {
  return (
    <main className="synth-page synth-home">
      <div className="synth-page__bg synth-page__bg--left" />
      <div className="synth-page__bg synth-page__bg--right" />
      <div className="synth-page__bg synth-page__grid" />

      <section className="synth-shell container-fluid">
        <div className="synth-shell__frame">
          <header className="synth-hero">
            <h1 className="synth-title">Bem-vindo ao MonApp</h1>
            <p className="synth-hero__subtitle">
              Escolha para onde deseja ir: cadastrar novas despesas ou consultar registros
              existentes.
            </p>
          </header>

          <div className="synth-card synth-home__card">
            <div className="synth-home__actions">
              <Link
                to="/cadastro"
                className="synth-button synth-button--primary synth-home__action-link"
              >
                Entrar em Cadastro
              </Link>

              <Link
                to="/consulta"
                className="synth-button synth-button--secondary synth-home__action-link"
              >
                Entrar em Consulta
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
