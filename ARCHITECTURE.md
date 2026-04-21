# Frontend Architecture

## Overview

The frontend follows a feature-based architecture with a clean separation of concerns.

## Directory Structure

### App Directory (Next.js App Router)

- **`(auth)`**: Authentication routes (login page)
- **`(dashboard)`**: Protected dashboard routes
  - `dashboard/page.tsx`: Main dashboard
  - `medications/page.tsx`: Medication management
  - `users/page.tsx`: User management
  - `analytics/page.tsx`: Analytics and reports
  - `audit-logs/page.tsx`: Audit log viewer
  - `layout.tsx`: Dashboard layout with sidebar and header

### Components

#### Layout Components
- `AppShell`: Main layout wrapper (sidebar + header + content)
- `AppHeader`: Top navigation bar
- `AppSidebar`: Side navigation menu
- `NavItem`: Navigation link with active state

#### UI Components
- `Button`: Primary, secondary, and danger variants
- `Input`: Text input field
- `Card`: Content container
- `Badge`: Status indicator
- `Table`: Data table with header, rows, and cells
- `PageHeader`: Page title with optional actions
- `EmptyState`: Placeholder for empty data
- `LoadingState`: Loading spinner

### Features

Each feature follows a consistent structure:

```
features/[feature-name]/
├── api/           # API functions
├── hooks/         # React Query hooks
├── store/         # Zustand stores (if needed)
└── types/         # TypeScript types
```

#### Auth Feature
- `api/login.ts`: Login API call
- `store/auth-store.ts`: Authentication state management
- `hooks/useCurrentUser.ts`: Current user hook
- `types/index.ts`: Auth types (CurrentUser, LoginInput, LoginResponse)

#### Dashboard Feature
- `api/get-dashboard-summary.ts`: Dashboard summary data
- `hooks/useDashboardSummary.ts`: Dashboard summary hook
- `types/index.ts`: Dashboard types

#### Medications Feature
- `types/index.ts`: Medication types

#### Users Feature
- `types/index.ts`: User types

#### Audit Feature
- `types/index.ts`: Audit log types

### Lib (Shared Utilities)

- `api-client.ts`: Axios instance with interceptors
- `auth.ts`: Token storage and retrieval
- `constants.ts`: App-wide constants (routes, roles)
- `query-client.ts`: React Query client configuration
- `query-keys.ts`: React Query key factories

### Stores

- `ui-store.ts`: UI state (modals, sidebars)

## Data Flow

### Authentication
1. User enters credentials on login page
2. Login API call returns JWT token and user data
3. Token stored in localStorage via `auth.ts`
4. User data stored in Zustand auth store
5. Protected routes check auth state on mount

### Data Fetching
1. Components use React Query hooks (e.g., `useDashboardSummary`)
2. Hooks call API functions (e.g., `getDashboardSummary`)
3. API functions use configured axios instance
4. React Query handles caching, loading, and error states
5. Components render based on query state (loading, error, success)

## Key Patterns

### Feature-Based Organization
Each feature is self-contained with its own API, hooks, types, and stores. This promotes:
- Better code organization
- Easier feature discovery
- Clear boundaries between features

### React Query for Data
All data fetching uses React Query for:
- Automatic caching
- Background refetching
- Optimistic updates
- Loading and error states

### Zustand for State
Global state uses Zustand for:
- Authentication state
- UI state (modals, sidebars)
- Simple, lightweight state management

### Type Safety
TypeScript is used throughout:
- API response types
- Component props
- Store state
- Query keys

## Future Improvements

- Migrate inline styles to Tailwind CSS
- Add error boundaries
- Implement form validation
- Add unit and integration tests
- Implement role-based access control
- Add loading skeletons
- Implement infinite scroll for lists
