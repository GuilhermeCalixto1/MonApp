import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

document.title = 'MONAPP';

const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.sizes = '96x96';
favicon.href = '/favicon-96.png';

if (!favicon.parentNode) {
  document.head.appendChild(favicon);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
