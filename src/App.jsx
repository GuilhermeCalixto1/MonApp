import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Cadastro from './pages/Cadastro';
import Consulta from './pages/Consulta';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/cadastro" replace />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/consulta" element={<Consulta />} />
        <Route path="*" element={<Navigate to="/cadastro" replace />} />
      </Routes>
    </>
  );
}
