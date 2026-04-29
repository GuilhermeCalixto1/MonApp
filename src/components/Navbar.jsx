import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../images/logo.png';
import appName from '../images/AppName.png';

export default function Navbar({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar navbar-dark synth-navbar">
      <div className="container">
        <Link className="navbar-brand synth-navbar__brand" to="/">
          <img src={logo} width="180" alt="Orcamento pessoal" />
          <img className="synth-navbar__app-name" src={appName} alt="MonApp" />
        </Link>

        <div className="synth-navbar__menu-wrap ms-auto">
          <button
            type="button"
            className="synth-navbar__menu-toggle"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span aria-hidden="true" className="synth-navbar__menu-lines">
              <span />
              <span />
              <span />
            </span>
          </button>

          <div className={`synth-navbar__menu ${menuOpen ? 'is-open' : ''}`}>
            <ul className="navbar-nav synth-navbar__links">
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link synth-navbar__link${isActive ? ' active' : ''}`
                  }
                  to="/cadastro"
                  end
                  onClick={closeMenu}
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
                  onClick={closeMenu}
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
                  onClick={closeMenu}
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
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link synth-navbar__link synth-navbar__logout"
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                >
                  Sair
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
