import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Force all libraries to use the single copy of React in your root folder
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },

  },
  test: {
    globals: true,           // <--- FIXES 'describe is not defined'
    environment: 'jsdom', 
    setupFiles: './src/setupTests.js',   // <--- FIXES 'document is not defined
  },
})
