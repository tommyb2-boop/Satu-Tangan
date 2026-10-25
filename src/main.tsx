import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker immediately for instant caching and Android installation
registerSW({
  immediate: true,
  onNeedRefresh() {
    // When a new version is deployed to Vercel, update seamlessly
  },
  onOfflineReady() {
    console.log('Aplikasi Satu Tangan siap digunakan offline di perangkat Android.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
