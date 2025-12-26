# Redux Store Setup

This project uses Redux Toolkit with Redux Persist for state management.

## Structure

- `slices/` - Contains all Redux slices
  - `authSlice.ts` - Authentication state (persisted)
  - `appSlice.ts` - Application-level state (persisted)
- `hooks.ts` - Typed Redux hooks
- `index.ts` - Store configuration

## Usage

### Using Redux Hooks

```typescript
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setCredentials, logout } from '@store/slices/authSlice';

// In your component
const dispatch = useAppDispatch();
const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
const token = useAppSelector((state) => state.auth.token);

// Dispatch actions
dispatch(setCredentials({ userId: '123', token: 'abc', userDetails: {} }));
dispatch(logout());
```

### Auth Slice

The auth slice stores:
- `userId`: string | null
- `token`: string | null
- `userDetails`: UserDetails | null
- `isAuthenticated`: boolean

All auth state is persisted to AsyncStorage.

### App Slice

The app slice stores:
- `isLoading`: boolean
- `language`: string
- `theme`: 'light' | 'dark'

Language and theme are persisted to AsyncStorage.
