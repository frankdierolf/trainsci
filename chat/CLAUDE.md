# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 4 AI chatbot application built with modern web technologies:
- **Frontend**: Nuxt 4 with Vue 3 and Nuxt UI components
- **Backend**: Nitro server with API routes
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: AI SDK v5 with Vercel AI Gateway for unified model access
- **Authentication**: GitHub OAuth via nuxt-auth-utils

## Development Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Linting
pnpm lint

# Type checking
pnpm typecheck

# Database operations
pnpm db:generate  # Generate database migrations
pnpm db:migrate   # Run database migrations
```

## Architecture

### Directory Structure
- `/app/` - Nuxt application code (pages, components, layouts, composables)
- `/server/` - Nitro server code
  - `/server/api/` - API routes for chat functionality
  - `/server/database/` - Drizzle schema and migrations
  - `/server/routes/` - Authentication routes
- `/shared/` - Shared types and utilities

### Key Configuration Files
- `nuxt.config.ts` - Main Nuxt configuration with modules and settings
- `drizzle.config.ts` - Database configuration pointing to PostgreSQL
- `package.json` - Dependencies and scripts

### AI Integration
- Uses AI SDK v5 with Vercel AI Gateway (`@ai-sdk/gateway`)
- Chat API endpoints in `/server/api/chats/` handle streaming AI responses
- Models accessed through unified gateway API (no individual provider keys needed)
- Chat history persisted in PostgreSQL database

### Database Schema
- Database schema defined in `/server/database/schema.ts`
- Uses Drizzle ORM for type-safe database operations
- Chat and message entities with user associations

### Environment Variables Required
```env
DATABASE_URL=<postgresql-connection-string>
AI_GATEWAY_API_KEY=<vercel-ai-gateway-key>
NUXT_SESSION_PASSWORD=<32-char-password>
NUXT_OAUTH_GITHUB_CLIENT_ID=<github-oauth-client-id>
NUXT_OAUTH_GITHUB_CLIENT_SECRET=<github-oauth-client-secret>
```

## AI Model Configuration

The application uses Vercel AI Gateway which provides:
- Unified API for multiple AI providers (OpenAI, Anthropic, Google, etc.)
- Automatic load balancing and fallbacks
- Usage monitoring and budget controls
- No need for individual provider API keys