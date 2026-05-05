/**
 * @file Точка входа в React-приложение.
 * @module main
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

/**
 * Инициализация корневого элемента и рендеринг приложения.
 * Оборачивает приложение в:
 * - {@link BrowserRouter} для работы маршрутизации.
 * - {@link StrictMode} для активации дополнительных проверок в режиме разработки.
 */
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
);
