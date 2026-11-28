/**
 * App.tsx
 *
 * Akar aplikasi (Bab 5): provider global (QueryClient + Auth) dibungkus
 * BrowserRouter, lalu pohon rute dari routes/index.tsx.
 * `AppRoutes` diekspor terpisah agar mudah diuji dengan MemoryRouter.
 */

import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
