# 🍽️ QRBites Frontend

Modern, responsive React application for the QRBites restaurant menu digitization platform. Built with React 18, TypeScript, Vite, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features](#features)
- [Routing](#routing)
- [State Management](#state-management)
- [Styling](#styling)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)

## 🎯 Overview

The QRBites frontend provides an intuitive, modern interface for restaurant owners to manage their menus and for customers to view digital menus via QR codes. The application is built with performance and user experience in mind, featuring responsive design, dark mode support, and progressive web app capabilities.

### 🌐 Production URL

- **Live Application**: [https://qr-bites-api.vercel.app](https://qr-bites-api.vercel.app)

### Key Features

- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🌙 **Dark Mode** - Theme switching support
- ⚡ **Fast Performance** - Optimized with Vite and React Query
- 🔐 **Secure Authentication** - JWT-based auth with protected routes
- 📊 **Real-time Updates** - Optimistic updates with TanStack Query
- ✅ **Form Validation** - Type-safe validation with Zod
- 🖼️ **Image Management** - Upload, crop, and compress images
- 📱 **QR Code Generation** - Dynamic QR codes for menus
- ♿ **Accessible** - WCAG compliant components

## 🛠️ Tech Stack

### Core Technologies

- **React** 18.2 - UI library
- **TypeScript** 5.8 - Type safety
- **Vite** 6.3 - Build tool and dev server
- **Tailwind CSS** 3.4 - Utility-first CSS framework

### Key Libraries

- **React Router** 7.5 - Routing and navigation
- **TanStack Query** 5.75 (React Query) - Server state management
- **React Hook Form** 7.56 - Form management
- **Zod** 3.24 - Schema validation
- **Axios** 1.6 - HTTP client
- **Headless UI** 2.2 - Unstyled accessible components
- **Heroicons** 2.2 - Icon library
- **Notistack** 3.0 - Toast notifications
- **date-fns** 4.1 - Date utilities

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript linting
- **Tailwind ESLint Plugin** - Tailwind CSS linting

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- QRBites Backend running (see [backend README](../backend/README.md))

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_DEMO_EMAIL=demo@example.com
   VITE_DEMO_PASSWORD=demo123
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will start on `http://localhost:5173`

### Available Scripts

```bash
# Development
npm run dev              # Start development server with HMR
npm run preview          # Preview production build locally

# Build
npm run build            # Build for production (TypeScript + Vite)
npm run type-check       # Run TypeScript type checking

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier

# Utilities
npm run clean            # Remove node_modules, dist, .vercel
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── App.tsx                     # Root component
│   │
│   ├── api/                        # API client setup
│   │
│   ├── assets/                     # Static assets
│   │   ├── QRBites.svg
│   │   └── QRBitesLight.svg
│   │
│   ├── components/                 # Reusable components
│   │   ├── app/                    # App-level components
│   │   │   ├── AppRouter.tsx       # Main router
│   │   │   └── index.ts
│   │   │
│   │   └── common/                 # Common UI components
│   │       ├── buttons/            # Button components
│   │       │   ├── Button.tsx
│   │       │   ├── IconButton.tsx
│   │       │   └── LoadingButton.tsx
│   │       │
│   │       ├── cards/              # Card components
│   │       │   ├── Card.tsx
│   │       │   ├── MenuCard.tsx
│   │       │   └── RestaurantCard.tsx
│   │       │
│   │       ├── dialogs/            # Modal dialogs
│   │       │   ├── Dialog.tsx
│   │       │   └── ConfirmDialog.tsx
│   │       │
│   │       ├── feedback/           # Feedback components
│   │       │   ├── Alert.tsx
│   │       │   ├── Spinner.tsx
│   │       │   └── EmptyState.tsx
│   │       │
│   │       ├── forms/              # Form components
│   │       │   ├── Input.tsx
│   │       │   ├── Select.tsx
│   │       │   ├── Textarea.tsx
│   │       │   └── ImageUpload.tsx
│   │       │
│   │       ├── layout/             # Layout components
│   │       │   ├── Container.tsx
│   │       │   ├── Header.tsx
│   │       │   └── Footer.tsx
│   │       │
│   │       └── navigation/         # Navigation components
│   │           ├── Navbar.tsx
│   │           ├── Sidebar.tsx
│   │           └── Breadcrumbs.tsx
│   │
│   ├── config/                     # Configuration files
│   │   ├── api.ts                  # API configuration
│   │   ├── app.config.ts           # App configuration
│   │   ├── env.ts                  # Environment variables
│   │   │
│   │   └── routes/                 # Route configuration
│   │       ├── routes.tsx          # Route definitions
│   │       └── navigation.tsx      # Navigation config
│   │
│   ├── contexts/                   # React contexts
│   │   └── ThemeContext.tsx        # Theme context (dark mode)
│   │
│   ├── features/                   # Feature modules
│   │   ├── auth/                   # Authentication
│   │   │   ├── api/                # Auth API calls
│   │   │   ├── components/         # Auth components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── contexts/           # Auth context
│   │   │   │   └── AuthContext.tsx
│   │   │   ├── hooks/              # Auth hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   └── useRegister.ts
│   │   │   ├── pages/              # Auth pages
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── types/              # Auth types
│   │   │   ├── utils/              # Auth utilities
│   │   │   └── validations/        # Zod schemas
│   │   │
│   │   ├── restaurants/            # Restaurant management
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── types/
│   │   │   └── validations/
│   │   │
│   │   ├── menus/                  # Menu management
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── types/
│   │   │   └── validations/
│   │   │
│   │   ├── viewer/                 # Public menu viewer
│   │   │   ├── components/
│   │   │   └── pages/
│   │   │
│   │   ├── qr/                     # QR code generation
│   │   │   ├── components/
│   │   │   └── utils/
│   │   │
│   │   ├── home/                   # Home/landing page
│   │   │   ├── components/
│   │   │   └── pages/
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── PublicLayout.tsx
│   │   │
│   │   ├── errorHandling/          # Error handling
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   │
│   │   └── notifications/          # Notification system
│   │       ├── components/
│   │       └── hooks/
│   │
│   ├── hooks/                      # Global custom hooks
│   │   ├── useWindowSize.ts        # Window size hook
│   │   ├── useNetworkStatus.ts     # Network status
│   │   └── useVirtualizedList.ts   # List virtualization
│   │
│   ├── providers/                  # App providers
│   │   └── AppProviders.tsx        # Combined providers
│   │
│   ├── styles/                     # Global styles
│   │   ├── index.css               # Main stylesheet
│   │   └── designTokens.ts         # Design tokens
│   │
│   ├── types/                      # Global TypeScript types
│   │   └── designTokens.d.ts
│   │
│   ├── utils/                      # Utility functions
│   │   ├── apiUtils.ts             # API helpers
│   │   ├── cn.ts                   # Class name utility
│   │   ├── date.ts                 # Date formatting
│   │   └── designTokenUtils.ts     # Design token helpers
│   │
│   └── env.d.ts                    # Environment type definitions
│
├── public/                         # Static files
│   └── favicon.png
│
├── index.html                      # HTML entry point
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.cjs             # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── eslint.config.mjs               # ESLint configuration
├── vercel.json                     # Vercel deployment config
└── package.json
```

## ✨ Features

### Authentication

- JWT-based authentication
- Protected routes with automatic redirect
- Persistent auth state with localStorage
- Token refresh mechanism
- Role-based access control

```tsx
// Protected route example
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Form Management

Forms are built with React Hook Form and Zod for type-safe validation:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from './validations/loginSchema'

const {
  register,
  handleSubmit,
  formState: { errors }
} = useForm({
  resolver: zodResolver(loginSchema)
})
```

### Data Fetching

TanStack Query for efficient server state management:

```tsx
import { useQuery, useMutation } from '@tanstack/react-query'

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['menus', restaurantId],
  queryFn: () => fetchMenus(restaurantId)
})

// Mutate data
const mutation = useMutation({
  mutationFn: createMenu,
  onSuccess: () => {
    queryClient.invalidateQueries(['menus'])
  }
})
```

### Image Management

- Upload with drag & drop or click
- Image cropping with react-easy-crop
- Client-side compression
- Cloudinary integration
- Preview before upload

### QR Code Generation

Dynamic QR code generation for menus:

```tsx
import { generateQRCode } from '@/features/qr/utils/qrCodeUtils'

const qrCodeDataUrl = await generateQRCode(menuUrl)
```

### Theme Support

Dark mode with context-based theme switching:

```tsx
import { useTheme } from '@/contexts/ThemeContext'

const { theme, toggleTheme } = useTheme()
```

## 🧭 Routing

React Router 7 with type-safe routes:

```tsx
// Route definitions
export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  restaurants: '/restaurants',
  restaurantDetail: '/restaurants/:id',
  menus: '/menus',
  menuDetail: '/menus/:id',
  menuView: '/view/:menuId',
}
```

### Protected Routes

```tsx
<Route element={<ProtectedRoute requiredRole="restaurantOwner" />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/restaurants" element={<RestaurantsPage />} />
</Route>
```

## 🎨 Styling

### Tailwind CSS

Utility-first CSS framework with custom configuration:

```javascript
// tailwind.config.cjs
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
}
```

### Design Tokens

Centralized design tokens for consistency:

```typescript
// designTokens.ts
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ...
  }
}
```

### CSS Utilities

Custom utility for class name merging:

```tsx
import { cn } from '@/utils/cn'

<Button className={cn('base-classes', isActive && 'active-classes')} />
```

## 🧪 Testing

### Running Tests

```bash
# Run tests (when configured)
npm test

# Type checking
npm run type-check
```

### Testing Approach

- Component testing with React Testing Library
- Unit tests for utilities and hooks
- Integration tests for features
- E2E tests for critical flows

## 🏗️ Build & Deployment

### Production Build

```bash
# Type check and build
npm run build
```

Build output goes to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Environment Variables

```env
# Required
VITE_API_URL=https://qrbites-api.vercel.app

# Optional
VITE_DEMO_EMAIL=demo@example.com
VITE_DEMO_PASSWORD=demo123
```

For local development, use:
```env
VITE_API_URL=http://localhost:5000
```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel deploy
   ```

3. **Set environment variables** in Vercel dashboard

### Build Optimization

- **Code Splitting** - Automatic with React Router
- **Tree Shaking** - Dead code elimination
- **Minification** - JavaScript and CSS minification
- **Compression** - Gzip/Brotli compression
- **Image Optimization** - Client-side compression
- **Lazy Loading** - Route-based code splitting

### Performance

- **Vite** - Lightning-fast HMR and builds
- **React Query** - Efficient caching and data fetching
- **Virtualization** - Large lists with useVirtualizedList
- **Memoization** - React.memo and useMemo for optimization
- **Debouncing** - Search and input optimization

## 📊 State Management

### Server State

TanStack Query for all server data:

```tsx
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})
```

### Client State

- **Auth State** - AuthContext
- **Theme State** - ThemeContext
- **Form State** - React Hook Form
- **Local UI State** - useState/useReducer

## 🔧 Development Tips

### Hot Module Replacement

Vite provides instant HMR. Changes reflect immediately without full page reload.

### TypeScript

- Use strict mode for type safety
- Define types for API responses
- Use Zod for runtime validation
- Export types for reuse

### Code Organization

- **Features** - Group by feature, not by type
- **Components** - Keep components small and focused
- **Hooks** - Extract logic into custom hooks
- **Types** - Colocate types with their usage

### Best Practices

- Use semantic HTML
- Follow accessibility guidelines (WCAG)
- Implement error boundaries
- Handle loading and error states
- Use optimistic updates for better UX
- Implement proper form validation
- Use proper TypeScript types

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
```bash
npm run type-check
# Fix type errors before building
```

**Vite dev server won't start**
```bash
# Check if port 5173 is in use
lsof -ti:5173 | xargs kill -9
```

**API calls failing**
```bash
# Verify VITE_API_URL in .env
# Ensure backend is running
# Check CORS configuration
```

**Styles not applying**
```bash
# Rebuild Tailwind
npm run dev
# Check Tailwind config and purge settings
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
