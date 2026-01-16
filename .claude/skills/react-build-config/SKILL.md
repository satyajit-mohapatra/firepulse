name: react-build-config
description: Vite and TypeScript build configuration, scripts, and deployment patterns. Use when building the project, adding dependencies, or configuring the development environment.
---

**Tooling:** Vite 6.0.11, TypeScript 5.7.3

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Configuration

### Vite Config: `vite.config.ts`
```tsx
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/firepulse/',              // GitHub Pages path
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        emptyOutDir: true
    }
});
```

### TypeScript Config: `tsconfig.json`
```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "jsx": "react-jsx",
        "moduleResolution": "bundler",
        "paths": { "@/*": ["./*"] },  // Path alias
        "allowImportingTsExtensions": true
    }
}
```

## File Structure Requirements

- Entry point: `index.tsx`
- Main component: `App.tsx`
- HTML: `index.html`
- Build output: `dist/` (auto-generated)

## Import Patterns

```tsx
// Path alias (preferred)
import { FinancialData } from '@/types';

// Relative import
import SliderInput from './components/SliderInput';
```

## Adding Dependencies

```bash
# Add runtime dependency
npm install <package>

# Add dev dependency
npm install -D <package>

# Example: adding a UI library
npm install @shadcn/ui
```

## Building for Production

```bash
npm run build
# Output: dist/
```

Deploy `dist/` to:
- GitHub Pages (configured with `base: '/firepulse/'`)
- Netlify/Vercel: Point to `dist/`
- Static hosting: Upload `dist/` contents
