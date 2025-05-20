# QrBites Frontend Guidelines

QrBites is a platform that transforms photos of restaurant menus into digital menus with QR codes. This document details frontend rules, coding standards, and project structure tailored for the React/TypeScript application.

---

## 1. Tech Stack & Tools

- **Core Framework:** React 19.x with TypeScript 5.x
- **Styling:** Tailwind CSS 3.x
- **State Management:** React context provider
- **Routing:** React Router 7.x
- **Form Handling:** React Hook Form 7.x
- **Data Fetching:** React Query (TanStack Query) 5.x
- **Testing:** Jest and React Testing Library
- **Linting:** ESLint with Airbnb config
- **Formatting:** Prettier

Install core dependencies with:

```bash
npm install
```

Install development dependencies with:

```bash
npm install --save-dev
```

---

## 2. Code Style & Best Practices

### Component Definition

Use functional components with TypeScript interfaces:

### Typing Rules

- Strictly type all components, props, state, and functions
- Create dedicated type files for shared interfaces
- Use TypeScript's utility types when appropriate (Pick, Omit, Partial)
- Never use `any` – use `unknown` for truly dynamic data, then type-narrow
- Prefer type inference where possible to reduce verbosity

```tsx
// BAD
const [count, setCount] = useState<any>(0);

// GOOD
const [count, setCount] = useState(0); // Type inferred as number
```

### Design Principles

- **Component Architecture:**
  - Create small, reusable, single-responsibility components
  - Follow atomic design principles (atoms, molecules, organisms, templates, pages)
  - Use composition over inheritance

- **Custom Hooks:** Extract reusable logic into custom hooks

  ```tsx
  // Example custom hook
  const useMenuData = (restaurantId: string) => {
    return useQuery(['menu', restaurantId], () =>
      fetchMenu(restaurantId)
    );
  };
  ```

- **Performance Optimization:**
  - Use React.memo for computationally expensive components only
  - avoid useMemo and useCallback if possible
  - Avoid unnecessary re-renders

### File & Component Size Limits

- Maximum 150 lines per component file
- Maximum 100 characters per line
- Break larger components into smaller sub-components

### Error Handling & User Feedback

```tsx
// Example of proper error handling in async operations
const MenuLoader: React.FC<{ restaurantId: string }> = ({ restaurantId }) => {
  const { data, error, isLoading } = useMenuData(restaurantId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message="Failed to load menu. Please try again." />;
  }

  return <MenuDisplay items={data} />;
};
```

### Naming Conventions

- **Components/Files:** PascalCase (e.g., `NavBar.tsx`, `MenuDisplay.tsx`)
- **Variables/Functions:** camelCase (e.g., `fetchMenuData`, `isUserLoggedIn`)
- **Hooks:** camelCase prefixed with `use` (e.g., `useMenuFetch`)
- **Interfaces/Types:** PascalCase (e.g., `MenuItemProps`, `ApiResponse`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **CSS Classes:** kebab-case (manually written classes only, not Tailwind utilities)

---

## 3. Frontend Project Structure

```
src/
├── assets/                    # Static assets (images, fonts, etc.)
├── components/
│   ├── common/                # Shared components
│   │   ├── buttons/           # Button variants
│   │   ├── forms/             # Form elements
│   │   ├── layout/            # Layout components
│   │   └── feedback/          # Loaders, alerts, notifications
│   └── features/              # Feature-specific components
├── hooks/                     # Global Custom React hooks
├── contexts/                  # Global React context providers
├── Pages/                     # Page components
├── features/                  # Feature modules
│   ├── menu/
│   │   ├── api/               # API integration
│   │   ├── components/        # Feature-specific components
│   │   ├── hooks/             # Feature-specific hooks
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Helper functions
│   │   ├── validations/       # Validation schemas
│   │   └── index.ts           # Public API for the feature
├── utils/                     # Global Utility functions
├── types/                     # Global TypeScript definitions
├── config/                    # App configuration
├── styles/                    # Global styles
└── App.tsx                    # Main application component
```

- **Imports Organization:**
  1. External libraries
  2. Internal modules
  3. Components
  4. Styles

```tsx
// Example of proper imports organization
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchMenuData } from 'src/services/api';
import { formatPrice } from 'src/utils/formatting';

import Button from 'src/components/common/buttons/Button';
import MenuCard from './MenuCard';

import './MenuDisplay.css';
```

---

## 4. Testing Standards

- **Test Coverage:** Minimum 80% code coverage required
- **Component Testing:** Test all user interactions and state changes
- **Test File Location:** Co-locate test files with implementation files
- **Naming Convention:** `[ComponentName].test.tsx`

```tsx
// Example test for MenuItem component
import { render, screen, fireEvent } from '@testing-library/react';
import MenuItem from './MenuItem';

describe('MenuItem', () => {
  const mockProps = {
    name: 'Burger',
    price: 9.99,
    onSelect: jest.fn()
  };

  it('renders correctly', () => {
    render(<MenuItem {...mockProps} />);
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(<MenuItem {...mockProps} />);
    fireEvent.click(screen.getByText('Burger'));
    expect(mockProps.onSelect).toHaveBeenCalledWith('Burger');
  });
});
```

---

## 5. Performance & Accessibility

### Performance Requirements

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Optimize images and lazy-load off-screen content
- Implement code splitting for routes and large components

### Accessibility Standards

- Follow WCAG 2.1 AA standards
- Ensure proper heading hierarchy
- Use semantic HTML elements
- Include ARIA attributes where necessary
- Maintain minimum contrast ratios
- Ensure keyboard navigation works properly

---

## 6. Git & Development Workflow

### Branching Strategy

- `main` - Production branch
- `develop` - Development branch
- `feature/[feature-name]` - Feature branches
- `bugfix/[bug-description]` - Bug fix branches

### Commit Message Format

```
type(scope): short description

[optional body]
```

Types: feat, fix, docs, style, refactor, test, chore
Example: `feat(menu): add filter for dietary restrictions`

### Pull Request Process

1. Create PR from feature branch to develop
2. Ensure all tests pass
3. Get at least one code review
4. Squash and merge when approved

---

## 7. Environment Configuration

- Use `.env` files for environment variables
- Never commit sensitive values to the repository
- Follow the pattern:
  - `.env` - Default values, safe to commit
  - `.env.local` - Local overrides, do not commit
  - `.env.development` - Development-specific, can commit
  - `.env.production` - Production-specific, can commit

```tsx
// Accessing environment variables
const apiUrl = process.env.REACT_APP_API_URL;
```
