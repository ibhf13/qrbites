# Notification & Error Handling System

This document describes the notification and error handling system for the QR Bites application.

## Overview

The notification system provides:

1. Toast notifications for different message types (success, error, warning, info)
2. Global error boundary to catch uncaught exceptions
3. Network status monitoring
4. Form validation error display
5. API error handling

## Components

### Notification Components

- **NotificationSnackbar**: The actual toast notification component that appears on screen
- **NotificationHistory**: A component that displays all recent notifications and allows users to view them
- **NetworkStatusIndicator**: Shows online/offline status and notifies when connection changes

### Error Handling Components

- **ErrorBoundary**: Catches uncaught React exceptions
- **ErrorDisplay**: Displays error messages in different formats (inline, banner, full page)
- **FormError**: Displays form field validation errors
- **ValidationErrorSummary**: Shows a summary of all validation errors for a form

## Contexts

### NotificationContext

The `NotificationContext` manages notification state, including:

- Creating notifications
- Storing notification history
- Dismissing notifications

## Hooks

### useNotificationContext

Main hook for working with notifications:

```tsx
const { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo 
} = useNotificationContext();

// Example usage
showSuccess('Item created successfully');
showError('Failed to save changes');
```

### useApiErrorHandler

Hook for handling API errors consistently:

```tsx
const { handleApiError } = useApiErrorHandler();

// Example usage with try/catch
try {
  await api.updateUser(userData);
  showSuccess('Profile updated');
} catch (error) {
  handleApiError(error, { 
    fallbackMessage: 'Unable to update profile' 
  });
}

// Example with React Query
useMutation(updateUser, {
  onSuccess: () => showSuccess('Profile updated'),
  onError: (error) => handleApiError(error)
});
```

### useNetworkStatus

Hook for monitoring network connectivity:

```tsx
const { isOnline, wasOffline, since } = useNetworkStatus();

return (
  <div>
    {!isOnline && (
      <Banner variant="warning">
        You are currently offline. Changes will be saved when you reconnect.
      </Banner>
    )}
  </div>
);
```

## Usage Examples

### Basic Notifications

```tsx
import { useNotificationContext } from '../../contexts/NotificationContext';

const MyComponent = () => {
  const { showSuccess, showError } = useNotificationContext();

  const handleSave = async () => {
    try {
      // Save data
      showSuccess('Data saved successfully');
    } catch (error) {
      showError('Failed to save data');
    }
  };

  return (
    <button onClick={handleSave}>Save</button>
  );
};
```

### Advanced Notifications

```tsx
const { showWarning } = useNotificationContext();

showWarning('Your session will expire soon', {
  title: 'Session Expiring',
  duration: 10000, // 10 seconds
  actions: [
    {
      label: 'Extend Session',
      onClick: () => extendSession()
    }
  ]
});
```

### Form Validation Errors

```tsx
import { FormError } from '../../components/common';

const MyForm = () => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  return (
    <form>
      <div>
        <label>Username</label>
        <input name="username" />
        <FormError errors={errors.username} />
      </div>
      
      <div>
        <label>Email</label>
        <input name="email" type="email" />
        <FormError errors={errors.email} />
      </div>
      
      <ValidationErrorSummary errors={errors} />
    </form>
  );
};
```

### Error Boundary

```tsx
import { ErrorBoundary } from '../../components/common';

const App = () => {
  return (
    <ErrorBoundary>
      <YourApplication />
    </ErrorBoundary>
  );
};
```

## API Reference

### NotificationOptions

```typescript
interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number; // ms, default 5000
  dismissible?: boolean; // default true
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onDismiss?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}
```

### ValidationErrors

```typescript
interface ValidationErrors {
  [fieldName: string]: string[];
}
``` 