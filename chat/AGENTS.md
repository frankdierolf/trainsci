# AI Agent Configuration for Nuxt Chat Application

## Build & Development Commands
```bash
pnpm dev           # Start development server
pnpm build         # Build for production  
pnpm lint          # Run ESLint
pnpm typecheck     # Type checking with vue-tsc
pnpm db:generate   # Generate Drizzle migrations
pnpm db:migrate    # Apply database migrations
```

## Code Style Guidelines
- **Framework**: Nuxt 4 with Vue 3 Composition API (`<script setup>`)
- **TypeScript**: Strict mode enabled, use explicit types for function params/returns
- **Imports**: Auto-imports configured for Nuxt/Vue utilities, avoid relative imports when possible
- **Components**: PascalCase for component names, use `@nuxt/ui` components when available
- **Formatting**: No trailing commas, 1tbs brace style, max 3 attributes per line in Vue templates
- **State**: Use composables (e.g., `useChats()`, `useModels()`) for shared state
- **API Routes**: Place in `server/api/`, use Drizzle ORM for database operations
- **Error Handling**: Use `createError()` for API errors, handle async operations with try/catch
- **Database**: PostgreSQL with Drizzle ORM, define schemas in `server/database/schema.ts`