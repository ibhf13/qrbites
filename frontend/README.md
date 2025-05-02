# QrBites Frontend

A modern web application for restaurant menu digitization built with React, TypeScript, React Router, React Query, and Tailwind CSS.

## Features

- User authentication (register, login, logout)
- QR code scanning and generation for restaurant menus
- Restaurant menu browsing and search
- Responsive design for all devices

## Tech Stack

- **Core**: React, TypeScript
- **Routing**: React Router
- **State Management**: React Query for server state
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Development

### Prerequisites

- Node.js >= 16.x
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build
```

### Lint

```bash
# Run ESLint
npm run lint
```

## Project Structure

```
src/
├── api/        # API client and services
├── assets/     # Static assets
├── components/ # Reusable UI components
├── hooks/      # Custom React hooks
├── pages/      # Application pages/routes
├── store/      # Global state management
├── types/      # TypeScript type definitions
├── utils/      # Helper functions and utilities
├── App.tsx     # Main application component
└── main.tsx    # Entry point
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:5000/api
```

## API Integration

The frontend communicates with the backend API using Axios. API requests are made through service functions located in the `src/api` directory. React Query is used for data fetching, caching, and state management of server data.
