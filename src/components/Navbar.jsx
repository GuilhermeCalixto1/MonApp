import { Link, NavLink } from 'react-router-dom';
import logo from '../images/logo.png';
import appName from '../images/AppName.png';

export default function Navbar({ onLogout }) {
  return (
    <nav className="navbar navbar-dark synth-navbar">
      <div className="container">
        <Link className="navbar-brand synth-navbar__brand" to="/">
          <img src={logo} width="180" alt="Orcamento pessoal" />
          <img className="synth-navbar__app-name" src={appName} alt="MonApp" />
        </Link>

        <ul className="navbar-nav ms-auto synth-navbar__links flex-row">
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                `nav-link synth-navbar__link${isActive ? ' active' : ''}`
              }
              to="/cadastro"
              end
            >
              Cadastro
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                `nav-link synth-navbar__link${isActive ? ' active' : ''}`
              }
              to="/consulta"
            >
              Consulta
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                `nav-link synth-navbar__link${isActive ? ' active' : ''}`
              }
              to="/contas"
            >
              Contas
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                `nav-link synth-navbar__link${isActive ? ' active' : ''}`
              }
              to="/dashboard"
            >
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className="nav-link synth-navbar__link synth-navbar__logout"
              onClick={onLogout}
            >
              Sair
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
