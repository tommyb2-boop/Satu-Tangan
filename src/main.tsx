import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Mount React application immediately to prevent any blank screen on Android
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

// 2. Register Service Worker asynchronously in background without blocking initial paint
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        try {
          registerSW({
            immediate: true,
            onNeedRefresh() {
              console.log('Versi baru Satu Tangan tersedia.');
            },
            onOfflineReady() {
              console.log('Aplikasi Satu Tangan siap digunakan offline di perangkat Android.');
            },
          });
        } catch (e) {
          console.warn('PWA registerSW warning:', e);
        }
      })
      .catch((e) => {
        console.warn('PWA module registration skipped:', e);
      });
  });
}

