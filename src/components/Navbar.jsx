import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar navbar-dark synth-navbar">
      <div className="container">
        <Link className="navbar-brand synth-navbar__brand" to="/cadastro">
          <img src="/logo.png" width="50" height="35" alt="Orcamento pessoal" />
          <span>MonApp</span>
        </Link>

        <ul className="navbar-nav ms-auto synth-navbar__links flex-row">
          <li className="nav-item">
            <NavLink className={({ isActive }) => `nav-link synth-navbar__link${isActive ? ' active' : ''}`} to="/cadastro" end>
              Cadastro
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({ isActive }) => `nav-link synth-navbar__link${isActive ? ' active' : ''}`} to="/consulta">
              Consulta
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
