import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import viteLogo from './assets/vite.svg'; // import الأيقونة

// إنشاء رابط الأيقونة ديناميكيًا
const link = document.createElement('link');
link.rel = 'icon';
link.href = viteLogo;
document.head.appendChild(link);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
