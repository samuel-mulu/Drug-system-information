# Development Guide

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
Opens the app at http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Adding a New Feature

### 1. Create Feature Directory
```bash
mkdir -p features/new-feature/{api,hooks,types}
```

### 2. Define Types
```typescript
// features/new-feature/types/index.ts
export interface NewFeatureItem {
  id: string;
  name: string;
}
```

### 3. Create API Function
```typescript
// features/new-feature/api/get-items.ts
import { api } from '../../../lib/api';
import { NewFeatureItem } from '../types';

export async function getItems(): Promise<NewFeatureItem[]> {
  const response = await api.get('/items');
  return response.data;
}
```

### 4. Create React Query Hook
```typescript
// features/new-feature/hooks/useItems.ts
import { useQuery } from '@tanstack/react-query';
import { getItems } from '../api/get-items';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: getItems,
  });
}
```

### 5. Add Query Key
```typescript
// lib/query-keys.ts
export const queryKeys = {
  // existing keys...
  items: ['items'] as const,
} as const;
```

### 6. Create Page
```typescript
// app/(dashboard)/new-feature/page.tsx
import { useItems } from '../../../features/new-feature/hooks/useItems';

export default function NewFeaturePage() {
  const { data: items, isLoading } = useItems();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>New Feature</h1>
      {/* render items */}
    </div>
  );
}
```

## Adding a New UI Component

### 1. Create Component File
```typescript
// components/ui/new-component.tsx
import { ReactNode } from 'react';

interface NewComponentProps {
  children: ReactNode;
}

export function NewComponent({ children }: NewComponentProps) {
  return <div>{children}</div>;
}
```

### 2. Export from Index (optional)
```typescript
// components/ui/index.ts
export { NewComponent } from './new-component';
```

## Adding a New Route

### 1. Add Route Constant
```typescript
// lib/constants.ts
export const ROUTES = {
  // existing routes...
  NEW_ROUTE: '/dashboard/new-route',
} as const;
```

### 2. Add Sidebar Navigation Item
```typescript
// lib/constants.ts
export const SIDEBAR_NAV_ITEMS = [
  // existing items...
  { label: 'New Route', href: ROUTES.NEW_ROUTE },
] as const;
```

### 3. Create Page
```typescript
// app/(dashboard)/new-route/page.tsx
export default function NewRoutePage() {
  return <div>New Route Page</div>;
}
```

## API Integration

### Making API Calls
Use the configured axios instance from `lib/api-client.ts`:

```typescript
import { api } from '../../lib/api';

// GET request
const response = await api.get('/endpoint');

// POST request
const response = await api.post('/endpoint', { data });

// PUT request
const response = await api.put('/endpoint', { data });

// DELETE request
const response = await api.delete('/endpoint');
```

### Error Handling
API errors are handled by the axios interceptor in `api-client.ts`. React Query will automatically catch and expose errors in the `error` property of the query result.

## State Management

### Using Zustand Stores
```typescript
import { useAuthStore } from '../../features/auth/store/auth-store';

// Read state
const user = useAuthStore((state) => state.user);

// Update state
const setUser = useAuthStore((state) => state.setUser);
setUser({ id: '1', name: 'John' });
```

## Authentication

### Checking Auth Status
```typescript
import { useAuthStore } from '../../features/auth/store/auth-store';

const user = useAuthStore((state) => state.user);
const isAuthenticated = !!user;
```

### Getting Auth Token
```typescript
import { getAuthToken } from '../../lib/auth';

const token = getAuthToken();
```

### Logging Out
```typescript
import { useAuthStore } from '../../features/auth/store/auth-store';
import { clearAuthToken } from '../../lib/auth';
import { useRouter } from 'next/navigation';

const clearAuth = useAuthStore((state) => state.clearAuth);
const router = useRouter();

const handleLogout = () => {
  clearAuth();
  clearAuthToken();
  router.push('/login');
};
```

## Styling

Currently using inline styles for rapid prototyping. This will be migrated to Tailwind CSS in the future.

### Adding Inline Styles
```typescript
<div style={{ padding: '20px', backgroundColor: 'white' }}>
  Content
</div>
```

## Testing

Tests are not yet implemented. Plan to add:
- Unit tests for utilities and hooks
- Integration tests for API calls
- Component tests for UI components
- E2E tests for critical user flows

## Troubleshooting

### TypeScript Errors
- Ensure all types are properly imported
- Check that `@types/react` and `@types/node` are installed
- Run `npm run type-check` for detailed errors

### Build Errors
- Clear the `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for circular dependencies

### API Errors
- Verify the backend is running
- Check the API base URL in `lib/api-client.ts`
- Check browser console for detailed error messages
