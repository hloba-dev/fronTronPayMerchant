import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Все запросы, начинающиеся с /admin, будут перенаправлены на http://localhost:3000
      '/admin': 'http://localhost:3000',
      // Все запросы, начинающиеся с /reports, также будут перенаправлены
      '/reports': 'http://localhost:3000',
    }
  }
});
