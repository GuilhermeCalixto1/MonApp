import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import Cadastro from './pages/Cadastro';
import Consulta from './pages/Consulta';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { ensureDefaultUser, isAuthenticated, logout } from './services/auth';

ensureDefaultUser();

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  const requireAuth = (element) => {
    if (!authenticated) {
      return <Navigate to="/login" replace />;
    }

    return element;
  };

  return (
    <>
      {authenticated && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/login"
          element={
            authenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLoginSuccess={() => setAuthenticated(true)} />
            )
          }
        />
        <Route path="/" element={requireAuth(<Inicio />)} />
        <Route path="/cadastro" element={requireAuth(<Cadastro />)} />
        <Route path="/consulta" element={requireAuth(<Consulta />)} />
        <Route path="/dashboard" element={requireAuth(<Dashboard />)} />
        <Route path="*" element={<Navigate to={authenticated ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
}
