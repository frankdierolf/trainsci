# SciArmy Chat Platform

AI agents that help scientists with research tasks.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sciarmy.com-blue?style=for-the-badge)](https://sciarmy.com)

## Hackathon Project

Built during [Blocktrain](https://blocktrain.devfolio.co/) - 36 hours on a moving train from Bengaluru to Delhi. Special thanks to the [Nuxt UI chat template](https://github.com/nuxt-ui-templates/chat) which made this possible in such limited time.

**Note:** This is a proof-of-concept demonstration. Agents return simulated responses to showcase the interface and user experience.

## What it does

SciArmy provides five AI agents that assist with common research workflows:

### Research Agents

**IP Blockchain Agent** - Protect research with blockchain timestamping
```
@ip-blockchain-agent protect my quantum computing research
```

**Literature Agent** - Search and analyze academic papers
```
@literature-agent search for papers on CRISPR gene therapy
```

**Peer Review Agent** - Validate research methodology
```
@peer-review-agent review my machine learning methodology
```

**Grant Agent** - Find funding opportunities
```
@grant-agent find funding for renewable energy research
```

**Cross-Domain Agent** - Discover interdisciplinary connections
```
@cross-domain-agent discover connections for neural networks
```

*Agents currently operate in demo mode with simulated responses.*

## Quick start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database
- GitHub OAuth application

### Installation

1. **Install dependencies:**
```bash
git clone <repository-url>
cd chat
pnpm install
```

2. **Environment setup:**
```bash
cp .env.example .env
```

Configure your environment variables:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sciarmy

# GitHub OAuth
NUXT_OAUTH_GITHUB_CLIENT_ID=your_github_client_id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret

# AI Gateway
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key

# Session security (minimum 32 characters)
NUXT_SESSION_PASSWORD=your_secure_password_here
```

3. **Database setup:**
```bash
pnpm db:migrate
```

4. **Start development:**
```bash
pnpm dev
```

Visit `http://localhost:3000` to start chatting with research agents.

## Architecture

### Technology Stack
- **Frontend:** Nuxt 4 with Vue 3
- **UI:** Nuxt UI with TailwindCSS
- **Backend:** Nitro server
- **Database:** PostgreSQL with Drizzle ORM
- **AI:** AI SDK v5 with Vercel AI Gateway
- **Auth:** GitHub OAuth

### Project Structure
```
chat/
├── app/                    # Nuxt application
│   ├── pages/             # Routes
│   ├── components/        # Vue components
│   └── composables/       # Shared state
├── server/                # Nitro server
│   ├── api/chats/        # Chat API
│   ├── database/         # DB schema
│   ├── routes/           # Auth routes
│   └── utils/tools.ts    # Agent definitions
├── shared/               # TypeScript types
└── nuxt.config.ts       # Configuration
```

## Development

### Available Commands
```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm lint          # Run ESLint
pnpm typecheck     # TypeScript checking
pnpm db:generate   # Generate migrations
pnpm db:migrate    # Apply migrations
```

### Adding New Agents

1. **Define the agent in `server/utils/tools.ts`:**
```typescript
export const tools = {
  yourAgent: {
    description: 'Description of what your agent does',
    inputSchema: z.object({
      query: z.string().describe('Input parameter')
    }),
    execute: async ({ query }) => {
      return { status: 'completed', result: 'output' }
    }
  }
}
```

2. **Add agent mapping:**
```typescript
const agentMap: Record<string, string> = {
  'your-agent': 'yourAgent'
}
```

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to [Vercel](https://vercel.com)
2. Configure environment variables
3. Deploy automatically on push

### Environment Variables
```env
DATABASE_URL=<postgresql-connection-string>
AI_GATEWAY_API_KEY=<vercel-ai-gateway-key>
NUXT_SESSION_PASSWORD=<32-char-password>
NUXT_OAUTH_GITHUB_CLIENT_ID=<github-oauth-client-id>
NUXT_OAUTH_GITHUB_CLIENT_SECRET=<github-oauth-client-secret>
```

## Research Impact

Traditional research timeline vs. with SciArmy:

| Task | Traditional | With SciArmy |
|------|-------------|--------------|
| Literature Review | 2-3 months | Hours |
| IP Protection | 2-4 weeks | Minutes |
| Grant Discovery | 1-2 weeks | Minutes |
| Methodology Review | 3-6 months | Minutes |

## Implementation Status

✅ **Built during Blocktrain:**
- Agent framework with dynamic UI components
- Chat interface with markdown and code highlighting
- GitHub authentication and chat persistence
- 5 demonstration agents with simulated responses
- Live deployments on sciarmy.com and deck.sciarmy.com

## Use Cases

**Individual Researchers**
- Graduate students: Literature review and methodology validation
- Post-docs: Grant discovery and cross-domain exploration
- Principal investigators: IP protection and research prioritization

**Research Teams**
- Collaborative discovery across disciplines
- Grant tracking and deadline optimization
- Quality assurance and methodology checking

Ready to accelerate your research? [Try SciArmy live](https://sciarmy.com)
