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

# Code quality
pnpm lint          # Run ESLint
pnpm typecheck     # Run TypeScript type checking

# Database operations
pnpm db:generate   # Generate database migrations from schema changes
pnpm db:migrate    # Apply database migrations to database

# Package management
pnpm install       # Install dependencies
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
- Chat API endpoints in `/server/api/chats/` handle streaming AI responses:
  - `[id].post.ts` - Main chat endpoint with streaming responses and tool execution
  - `[id].get.ts` - Retrieve specific chat
  - `[id].delete.ts` - Delete chat
- Streaming implementation using `createUIMessageStream` and `streamText` from AI SDK
- Models accessed through unified gateway API (no individual provider keys needed)
- Chat history persisted in PostgreSQL database with automatic title generation

### Database Schema
- Database schema defined in `/server/database/schema.ts`
- Uses Drizzle ORM for type-safe database operations
- Three main entities:
  - `users` - User profiles with GitHub OAuth integration
  - `chats` - Chat sessions with auto-generated UUIDs and titles
  - `messages` - Individual messages with role (user/assistant) and JSON parts
- Proper relational mapping with foreign keys and cascade deletes

### Environment Variables Required
```env
DATABASE_URL=<postgresql-connection-string>
AI_GATEWAY_API_KEY=<vercel-ai-gateway-key>
NUXT_SESSION_PASSWORD=<32-char-password>
NUXT_OAUTH_GITHUB_CLIENT_ID=<github-oauth-client-id>
NUXT_OAUTH_GITHUB_CLIENT_SECRET=<github-oauth-client-secret>
```

## Agent System

This application includes a custom agent system that allows triggering specific tools through chat commands:

### Agent Command Pattern
- Agents are triggered using the pattern `@{agent-name}-agent` in chat messages
- Detection logic is in `/server/utils/tools.ts` with `detectAgentCommand()` function
- Currently implemented agents:
  - `@waiting-agent` - A demo agent that waits for a specified duration

### Agent Architecture
- Tool definitions in `/server/utils/tools.ts` with Zod schema validation
- Agents execute asynchronously and return structured responses
- Integration with AI SDK streaming for real-time execution feedback

### Adding New Agents
1. Define agent in `tools` object in `/server/utils/tools.ts`
2. Include description, input schema (Zod), and execute function
3. Agent commands are automatically detected in chat messages

## AI Model Configuration

The application uses Vercel AI Gateway which provides:
- Unified API for multiple AI providers (OpenAI, Anthropic, Google, etc.)
- Automatic load balancing and fallbacks
- Usage monitoring and budget controls
- No need for individual provider API keys
- Chat title generation using `gpt-5-nano` model for automatic chat titling

## Key Implementation Details

### Chat Streaming
- Real-time AI responses using `streamText` with tool execution support
- UI message streams handle both text content and tool results
- Automatic chat title generation on first user message
- Message persistence with structured JSON parts for rich content

### Tool Integration Pattern
- Tools defined with Zod schemas for type safety
- Agent detection via regex pattern matching in chat messages
- Asynchronous tool execution with structured response format
- Integration with streaming responses for real-time feedback

### Authentication Flow
- GitHub OAuth via `nuxt-auth-utils`
- Session-based user management with automatic user creation
- User-scoped chat access with proper authorization checks