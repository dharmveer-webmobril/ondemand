# API Services Setup

This project uses React Query (TanStack Query) with Axios for API calls.

## Structure

- `axiosInstance.ts` - Configured axios instance with:
  - Base URL configuration
  - Automatic token injection in headers
  - Unauthorized error handling (401)
- `queryClient.ts` - React Query client configuration
- `queries/` - Query and mutation hooks
  - `exampleQueries.ts` - Example queries demonstrating the pattern

## Configuration

### Base URL

Update the `BASE_URL` in `axiosInstance.ts`:

```typescript
const BASE_URL = 'https://your-api-url.com';
```

### Automatic Headers

The axios instance automatically adds the Bearer token from Redux store to all requests:

```typescript
Authorization: Bearer <token>
```

### Unauthorized Handling

When a 401 response is received, the auth state is automatically cleared and the user is logged out.

## Creating New Query Files

1. Create a new file in `queries/` directory (e.g., `userQueries.ts`, `productQueries.ts`)
2. Import necessary hooks and axios instance:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { ApiResponse } from '../index';
```

3. Create your queries and mutations:

```typescript
// Query example
export const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse>('/users');
      return response.data;
    },
  });
};

// Mutation example
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post<ApiResponse>('/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

4. Use in your components:

```typescript
import { useGetUsers, useCreateUser } from '@services/api/queries/userQueries';

const MyComponent = () => {
  const { data, isLoading, error } = useGetUsers();
  const createUser = useCreateUser();
  
  // ... your component logic
};
```

## Extending the Setup

The setup is designed to be extensible:

- Add new query files in `queries/` directory
- Each file can contain related queries and mutations
- Import and use them anywhere in your app
- The axios instance handles authentication automatically
