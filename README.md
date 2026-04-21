# Drug Info System - Frontend

A Next.js application for managing medication inventory, users, and analytics.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Styling**: Tailwind CSS

## Project Structure

```
client/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth routes (login)
│   ├── (dashboard)/       # Dashboard routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── layout/           # Layout components (AppShell, AppHeader, etc.)
│   └── ui/               # UI components (Button, Input, Card, etc.)
├── features/             # Feature-based organization
│   ├── auth/             # Authentication
│   ├── dashboard/        # Dashboard
│   ├── medications/      # Medications
│   ├── users/            # User management
│   └── audit/            # Audit logs
├── lib/                  # Shared utilities
│   ├── api-client.ts     # API client configuration
│   ├── auth.ts           # Auth utilities
│   ├── constants.ts      # App constants
│   ├── query-client.ts   # React Query client
│   └── query-keys.ts     # React Query keys
└── stores/               # Global state stores
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env` from `.env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production (Vercel), set:

```bash
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

Use your real Render backend URL (no trailing slash needed).

## Key Features

- **Authentication**: Login with email/password
- **Dashboard**: Overview of system metrics
- **Medications**: Manage medication inventory
- **Users**: User and role management
- **Audit Logs**: Track system changes
- **Analytics**: View system statistics

## API Integration

The frontend communicates with a backend API via the configured API client in `lib/api-client.ts`. All API calls use React Query for data fetching and caching.

## Authentication Flow

1. User logs in via `/login`
2. The server sets an HTTP-only session cookie
3. The client hydrates the current user via `/api/auth/me`
4. Middleware protects private routes using the session cookie

## Roles

- **SYSTEM_ADMIN**: Full system access
- **MEDICATION_MANAGER**: Department-scoped medication CRUD access
- **VIEWER**: Read-only dashboard/analytics access

## Deploying Client To Vercel

1. Import the `client` folder as a Vercel project.
2. Framework preset: **Next.js** (auto-detected).
3. Build command: `npm run build`
4. Install command: `npm install`
5. Add environment variable in Vercel:
   - `NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com`
6. Deploy.

Important:
- Ensure your Render server CORS allows your Vercel frontend domain.
- If cookies are used cross-site, backend cookie settings must be `secure: true` and `sameSite: 'none'` in production.

## Development Notes

- TypeScript is used for type safety across the application
- React Query provides automatic caching and refetching of data
- Zustand handles global state (authentication, UI state)
