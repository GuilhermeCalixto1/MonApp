import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? 'nav-item active' : 'nav-item');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-5">
      <div className="container">
        <Link className="navbar-brand" to="/cadastro">
          <img src="/logo.png" width="50" height="35" alt="Orcamento pessoal" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Alternar navegacao"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto">
            <li className={isActive('/cadastro')}>
              <Link className="nav-link" to="/cadastro">
                Cadastro
              </Link>
            </li>
            <li className={isActive('/consulta')}>
              <Link className="nav-link" to="/consulta">
                Consulta
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
