import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.{test,spec}.ts', '__tests__/**/*.property.test.ts'],
    exclude: ['node_modules', '.next', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        '.next/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.config.ts',
        '**/*.config.mjs',
        '**/types/**',
        '__tests__/**',
        '**/prisma/**',
        '**/public/**',
        '**/styles/**',
        '**/docs/**',
        '**/.kiro/**',
        '**/middleware.ts',
        'app/**/loading.tsx',
        'app/**/error.tsx',
        'app/**/not-found.tsx',
        'app/**/layout.tsx',
        'app/**/page.tsx',
        'components/ui/**',
      ],
      // Coverage thresholds - minimum percentages required
      thresholds: {
        // Global thresholds
        statements: 30,
        branches: 25,
        functions: 30,
        lines: 30,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'server-only': path.resolve(__dirname, 'node_modules/next/dist/compiled/server-only/empty.js'),
    },
  },
})
