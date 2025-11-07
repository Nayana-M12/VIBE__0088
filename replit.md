# Green Intelligence Platform

## Overview

Green Intelligence is an AI-powered sustainability platform that gamifies eco-friendly behavior through resource usage prediction and rewards. The platform enables users to track energy consumption, water usage, and eco-friendly transportation routes while earning points redeemable for scratch cards and coupons. Built with a modern React frontend and Express backend, it leverages OpenAI's GPT-5 for intelligent analysis of consumption patterns and personalized sustainability recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management with aggressive caching (staleTime: Infinity)

**UI Component System**
- shadcn/ui components built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Custom theme system with CSS variables for light/dark mode support
- Typography: Inter for UI/data elements, Space Grotesk for headings
- Recharts for data visualization (line charts, bar charts)

**State Management Pattern**
- Server state: TanStack Query with centralized queryClient
- Authentication state: Custom useAuth hook consuming user query
- No global client state library - relying on React Query cache and component state

**Design System**
- Achievement-first approach with prominent gamification elements
- Progressive disclosure pattern for dense information
- Reference-based design inspired by Notion (dashboard), Strava (progress), Duolingo (gamification), Linear (data presentation)
- Responsive grid system: 12-column on desktop, stacked on mobile

### Backend Architecture

**Server Framework**
- Express.js with TypeScript running on Node.js
- ESM module system throughout
- Custom middleware for request logging with timing and response capture

**Authentication & Sessions**
- OpenID Connect (OIDC) integration with Replit Auth
- Passport.js strategy for authentication flow
- Session management via express-session with PostgreSQL storage (connect-pg-simple)
- 7-day session TTL with secure, httpOnly cookies

**API Design**
- RESTful endpoints under `/api` namespace
- Consistent error handling with 401 redirects for unauthorized requests
- Request body validation using Zod schemas derived from Drizzle tables
- JSON response format with captured logging

**AI Integration (OpenAI)**
- GPT-5 model for energy/water consumption analysis
- Structured JSON responses for predictive wastage calculations
- AI Sustainability Advisor chatbot for personalized eco-tips
- System prompts engineered for practical, actionable insights

### Data Storage

**Database**
- PostgreSQL via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe database operations
- Schema-first approach with Drizzle-Zod integration for validation

**Data Models**
- `users`: Core user profile with points, carbon saved, water saved metrics
- `posts`: Social feed for sharing sustainability achievements
- `energyRecords`: Monthly electricity consumption with AI-analyzed wastage
- `waterRecords`: Monthly water usage tracking with conservation tips
- `ecoRoutes`: Transportation route comparisons with carbon impact
- `scratchCards` / `userScratchCards`: Redeemable rewards system
- `coupons` / `userCoupons`: Brand partnership discount system
- `sessions`: Server-side session storage for authentication

**Storage Layer Pattern**
- Repository pattern implemented in `server/storage.ts`
- IStorage interface defines all data operations
- Encapsulates Drizzle queries behind clean async methods
- User points and environmental metrics updated atomically

### External Dependencies

**Third-Party Services**
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **OpenAI API**: GPT-5 for consumption analysis and conversational AI advisor
- **Replit Auth**: OIDC-based authentication provider (issuer: replit.com/oidc)

**Key Libraries**
- **@neondatabase/serverless**: PostgreSQL driver optimized for serverless with ws WebSocket polyfill
- **drizzle-orm & drizzle-kit**: Type-safe ORM with migration tooling
- **openid-client**: Standards-compliant OIDC client
- **@tanstack/react-query**: Declarative data fetching and caching
- **react-hook-form + @hookform/resolvers**: Form state management with Zod validation
- **recharts**: Composable charting library for consumption visualizations
- **lucide-react**: Icon system

**Development Tools**
- **@replit/vite-plugin-***: Replit-specific development enhancements (cartographer, dev-banner, runtime-error-modal)
- **tsx**: TypeScript execution for development server
- **esbuild**: Production build bundling for server code

**Environment Variables Required**
- `DATABASE_URL`: Neon PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit workspace identifier for OIDC
- `ISSUER_URL`: OIDC issuer endpoint (defaults to https://replit.com/oidc)