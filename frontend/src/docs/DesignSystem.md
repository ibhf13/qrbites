# QrBites Design System Documentation

This document provides guidance on using the QrBites design system to create consistent, responsive, and accessible user interfaces.

## Table of Contents

1. [Introduction](#introduction)
2. [Design Tokens](#design-tokens)
3. [Typography](#typography)
4. [Grid System](#grid-system)
5. [Components](#components)
6. [Usage Patterns](#usage-patterns)
7. [Accessibility](#accessibility)

## Introduction

The QrBites design system is built with:
- React and TypeScript
- Tailwind CSS for styling
- Component-based architecture following atomic design principles

## Design Tokens

Design tokens are the visual design atoms of the design system. They are stored in `src/styles/designTokens.ts`.

### Colors

We use a palette of colors with consistent naming:

```tsx
// Primary color with variations
<div className="text-primary-500">Primary text</div>
<div className="bg-primary-600">Primary background</div>

// Secondary color with variations
<div className="text-secondary-500">Secondary text</div>
<div className="bg-secondary-600">Secondary background</div>

// Accent color with variations
<div className="text-accent-500">Accent text</div>
<div className="bg-accent-600">Accent background</div>

// Semantic colors
<div className="text-success">Success message</div>
<div className="text-error">Error message</div>
<div className="text-warning">Warning message</div>
<div className="text-info">Info message</div>
```

### Typography

```tsx
// Heading styles
<h1 className="text-5xl font-display">Heading 1</h1>
<h2 className="text-4xl font-display">Heading 2</h2>
<h3 className="text-3xl font-display">Heading 3</h3>
<h4 className="text-2xl font-display">Heading 4</h4>
<h5 className="text-xl font-display">Heading 5</h5>
<h6 className="text-lg font-display">Heading 6</h6>

// Body text
<p className="text-base">Regular paragraph text</p>
<p className="text-sm">Small text</p>
<p className="text-xs">Extra small text</p>

// Font weights
<p className="font-light">Light text</p>
<p className="font-normal">Normal text</p>
<p className="font-medium">Medium text</p>
<p className="font-semibold">Semibold text</p>
<p className="font-bold">Bold text</p>
```

### Spacing

We use a consistent spacing scale. All spacing values are multiples of 4px (0.25rem):

```tsx
<div className="m-4">Margin of 1rem (16px)</div>
<div className="p-6">Padding of 1.5rem (24px)</div>
<div className="gap-8">Gap of 2rem (32px)</div>
```

## Grid System

QrBites uses a 12-column responsive grid system:

```tsx
import { Container, Row, Col } from '../components/common';

// Basic layout
<Container>
  <Row>
    <Col span={12} md={6} lg={4}>Column 1</Col>
    <Col span={12} md={6} lg={4}>Column 2</Col>
    <Col span={12} md={6} lg={4}>Column 3</Col>
  </Row>
</Container>

// With custom gaps
<Container>
  <Row gapX="6" gapY="8">
    <Col span={6}>Column 1</Col>
    <Col span={6}>Column 2</Col>
  </Row>
</Container>

// Fluid container (full width)
<Container fluid>
  Full width container
</Container>
```

## Components

### Buttons

```tsx
import { Button } from '../components/common';

// Button variants
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="accent">Accent Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>

// Button sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// Button states
<Button disabled>Disabled</Button>
<Button isLoading>Loading</Button>
<Button isFullWidth>Full Width</Button>

// Buttons with icons
<Button 
  leftIcon={<Icon />}
  rightIcon={<Icon />}
>
  Button with Icons
</Button>
```

### Form Inputs

```tsx
import { FormInput } from '../components/common';

// Basic input
<FormInput 
  label="Username" 
  placeholder="Enter your username"
/>

// Input with helper text
<FormInput 
  label="Email" 
  placeholder="Enter your email"
  helperText="We'll never share your email with anyone else."
/>

// Input with error
<FormInput 
  label="Password" 
  type="password"
  placeholder="Enter your password"
  error="Password must be at least 8 characters long"
/>

// Input with icons
<FormInput 
  label="Search" 
  placeholder="Search..."
  leftIcon={<SearchIcon />}
/>
```

### Cards

```tsx
import { Card } from '../components/common';

// Basic card
<Card>
  <p>Card content goes here</p>
</Card>

// Card with title and subtitle
<Card
  title="Card Title"
  subtitle="Card subtitle text"
>
  <p>Card content goes here</p>
</Card>

// Card with footer
<Card
  title="Card with Footer"
  footer={
    <div className="flex justify-end">
      <Button variant="outline" className="mr-2">Cancel</Button>
      <Button>Save</Button>
    </div>
  }
>
  <p>Card content goes here</p>
</Card>

// Card with custom action in header
<Card
  title="Card with Action"
  headerAction={<Button>Action</Button>}
>
  <p>Card content goes here</p>
</Card>

// Card variants
<Card variant="default">Default card</Card>
<Card variant="outlined">Outlined card</Card>
<Card variant="elevated">Elevated card</Card>
```

### Loading States

```tsx
import { LoadingSpinner } from '../components/common';

// Loading spinner sizes
<LoadingSpinner size="xs" />
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />
<LoadingSpinner size="xl" />

// Loading spinner colors
<LoadingSpinner color="primary" />
<LoadingSpinner color="secondary" />
<LoadingSpinner color="accent" />
<LoadingSpinner color="white" />

// Loading spinner with label
<LoadingSpinner label="Loading data..." />
```

### Error States

```tsx
import { ErrorDisplay } from '../components/common';

// Inline error
<ErrorDisplay 
  message="Something went wrong. Please try again later."
  variant="inline"
/>

// Banner error
<ErrorDisplay 
  title="Connection Error"
  message="Could not connect to the server. Please check your internet connection."
  variant="banner"
/>

// Full error with retry action
<ErrorDisplay 
  title="Data Not Found"
  message="We couldn't find the requested data."
  variant="full"
  onRetry={() => fetchData()}
/>
```

## Usage Patterns

### Responsive Design

Always design for mobile-first, then adapt for larger screens:

```tsx
// Element that changes from stacked on mobile to side-by-side on larger screens
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">Left content</div>
  <div className="w-full md:w-1/2">Right content</div>
</div>

// Hiding/showing elements based on screen size
<div className="hidden md:block">Only visible on medium screens and up</div>
<div className="block md:hidden">Only visible on small screens</div>
```

### Form Validation

```tsx
// Form input with validation
<FormInput
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError ? emailError : undefined}
/>

// Form submission with loading state
<Button 
  type="submit"
  isLoading={isSubmitting}
  disabled={isSubmitting || hasErrors}
>
  Submit
</Button>
```

### Data Loading States

```tsx
// Component with loading state
{isLoading ? (
  <LoadingSpinner size="lg" label="Loading data..." />
) : error ? (
  <ErrorDisplay
    message={error.message}
    onRetry={fetchData}
  />
) : (
  <DataDisplay data={data} />
)}
```

## Accessibility

Follow these accessibility guidelines:

1. **Color contrast**: Ensure text has sufficient contrast with its background
2. **Keyboard navigation**: All interactive elements must be accessible via keyboard
3. **Screen readers**: Use proper ARIA attributes when HTML semantics aren't sufficient
4. **Focus management**: Visible focus states for all interactive elements

```tsx
// Example of accessible button with ARIA
<Button
  aria-label="Close dialog"
  aria-pressed={isPressed}
>
  <CloseIcon />
</Button>

// Example of accessible form input
<FormInput
  id="email-input"
  label="Email Address"
  aria-describedby="email-helper email-error"
  aria-invalid={!!error}
  helperText="We'll never share your email"
  error={error}
/>
<div id="email-helper" className="sr-only">We'll never share your email</div>
<div id="email-error" className="sr-only">{error}</div>
```

---

## Contributing to the Design System

When adding new components or modifying existing ones:

1. Follow the established naming conventions
2. Ensure components are fully typed with TypeScript
3. Make components responsive by default
4. Document usage examples
5. Test across all required breakpoints
6. Ensure components meet accessibility standards

For more information, refer to the design system showcase at `/design-system` in the application. 