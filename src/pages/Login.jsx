import { useState } from 'react';
import { login } from '../services/auth';

export default function Login({ onLoginSuccess }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const ok = login(nome, senha);

    if (!ok) {
      setErro('Nome ou senha invalidos. Tente novamente.');
      return;
    }

    setErro('');
    onLoginSuccess();
  };

  return (
    <main className="synth-page synth-login">
      <div className="synth-page__bg synth-page__bg--left" />
      <div className="synth-page__bg synth-page__bg--right" />
      <div className="synth-page__bg synth-page__grid" />

      <section className="synth-shell container-fluid">
        <div className="synth-shell__frame synth-login__frame">
          <header className="synth-hero">
            <h1 className="synth-title">Login</h1>
            <p className="synth-hero__subtitle">Acesse com seu usuario para entrar no MonApp.</p>
          </header>

          <div className="synth-card synth-login__card">
            <form className="synth-login__form" onSubmit={handleSubmit}>
              <div className="synth-field">
                <label className="synth-label" htmlFor="nome">
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  className="synth-control"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                />
              </div>

              <div className="synth-field">
                <label className="synth-label" htmlFor="senha">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  className="synth-control"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                />
              </div>

              {erro && <p className="synth-login__erro">{erro}</p>}

              <button
                type="submit"
                className="synth-button synth-button--primary synth-login__button"
              >
                Entrar
              </button>

              <p className="synth-login__hint">Primeiro acesso: Guilherme / 123abc</p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
