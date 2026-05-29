import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 이전에 설치된 다른 PWA 서비스 워커 정리
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      // 우리 것이 아닌 다른 서비스 워커만 삭제
      if (registration.scope.includes('localhost')) {
        registration.unregister().then(() => {
          console.log('Old service worker unregistered');
        });
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
