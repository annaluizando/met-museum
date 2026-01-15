# MetMuseum Explorer 🎨

A modern, accessible web application for exploring The Metropolitan Museum of Art's collection of over 470,000 artworks. Built with Next.js, React Query, Zustand, and TypeScript.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React Query](https://img.shields.io/badge/React%20Query-5-red)
![Zustand](https://img.shields.io/badge/Zustand-5-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Core Functionality
- **🔍 Advanced Search**: Search artworks by title, artist, culture, or time period with real-time results and filters
- **♾️ Infinite Scroll**: Seamless pagination with automatic loading as you scroll
- **🎯 Artwork Details**: Comprehensive metadata including artist, date, medium, dimensions, and tags
- **🖼️ Image Viewer**: Full-screen modal for viewing high-resolution artwork images
- **🔗 Similar Artworks**: Discover related artworks with carousel navigation
- **⭐ Featured Artworks**: Curated featured collection on the homepage
- **📚 Collections Management**: Create, edit, and delete personal art collections with persistent storage
- **👁️ View Modes**: Toggle between grid and list views for optimal browsing experience
- **🌓 Theme Toggle**: Dark and light mode support
- **📱 Responsive Design**: Fully responsive from mobile to desktop

### Technical Highlights
- **Type-Safe**: Strict TypeScript with comprehensive type definitions
- **Accessible**: WCAG-compliant with proper ARIA labels and keyboard navigation
- **Performant**: Optimized with React Query caching, skeleton loaders, and code splitting
- **Well-Tested**: Unit and integration tests with Jest, and React Testing Library
- **Documented**: Storybook stories for all major components with Vitest integration
- **SEO-Friendly**: Dynamic metadata and proper semantic HTML
- **Search History**: Persistent search history for quick access to recent searches

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Technical Decisions](#key-technical-decisions)
- [Trade-offs & Future Improvements](#trade-offs--future-improvements)
- [Testing](#testing)
- [Storybook](#storybook)
- [Contributing](#contributing)

## 🏗️ Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App Router                    │
│                      (Server Components)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Client Components                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Search     │  │   Artwork    │  │  Collection  │      │
│  │   Features   │  │    Grid      │  │  Management  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         ▼                  ▼                  ▼               │
│  ┌──────────────────────────────────────────────────┐       │
│  │           State Management Layer                  │       │
│  │  ┌──────────────┐        ┌──────────────┐       │       │
│  │  │ React Query  │        │   Zustand    │       │       │
│  │  │  (Server)    │        │   (Client)   │       │       │
│  │  └──────┬───────┘        └──────┬───────┘       │       │
│  └─────────┼────────────────────────┼───────────────┘       │
└────────────┼────────────────────────┼───────────────────────┘
             │                        │
             ▼                        ▼
     ┌───────────────┐        ┌─────────────┐
     │   Met Museum  │        │  Local      │
     │      API      │        │  Storage    │
     └───────────────┘        └─────────────┘
```

### Data Flow

1. **Search Flow**:
   - User types in SearchBar → Zustand updates query → React Query triggers search
   - API fetches object IDs → Batch fetch artwork details → Infinite scroll pagination
   
2. **Collection Flow**:
   - User creates collection → Zustand stores data → LocalStorage persists
   - Data survives page reloads and browser sessions

3. **Detail View Flow**:
   - User clicks artwork → Next.js dynamic route → React Query fetches details
   - Server-side metadata generation for SEO

## 🛠️ Tech Stack

### Core
- **[Next.js 16.1.1](https://nextjs.org/)** - React framework with App Router
- **[React 19.2.3](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety

### State Management
- **[@tanstack/react-query](https://tanstack.com/query)** - Server state management with caching
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Client state management with persistence

### Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Lucide React](https://lucide.dev/)** - Icon library

### Development Tools
- **[Storybook 10.1.11](https://storybook.js.org/)** - Component documentation with Next.js Vite framework
- **[Jest](https://jestjs.io/)** - Unit testing
- **[Vitest](https://vitest.dev/)** - Fast unit testing with Vite
- **[React Testing Library](https://testing-library.com/)** - Component testing
- **[ESLint](https://eslint.org/)** - Code linting

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/annaluizando/met-museum.git
cd met-museum
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional - uses default Met API):
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run storybook    # Start Storybook
```

## 📁 Project Structure

```
metmuseum/
├── app/                          # Next.js App Router
│   ├── artwork/[id]/            # Dynamic artwork detail page
│   │   ├── page.tsx             # Server component with metadata
│   │   └── artworkDetailView.tsx  # Client component
│   ├── collections/             # Collections page
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (search)
│   └── globals.css              # Global styles
├── components/
│   ├── features/                # Feature-specific components
│   │   ├── artworkCard.tsx     # Artwork display card
│   │   ├── artworkCardSkeleton.tsx # Loading skeleton
│   │   ├── artworkGrid.tsx     # Grid with infinite scroll
│   │   ├── searchBar.tsx        # Search input with debounce
│   │   ├── searchFilters.tsx   # Search filter controls
│   │   ├── collectionForm.tsx  # CRUD form
│   │   ├── collectionList.tsx  # Collection management
│   │   ├── emptyState.tsx       # Empty state component
│   │   ├── errorState.tsx       # Error state component
│   │   ├── featuredArtworks.tsx # Featured artworks display
│   │   ├── imageViewer.tsx      # Image viewer modal
│   │   ├── similarArtworks.tsx  # Similar artworks carousel
│   │   └── addToCollection.tsx # Add artwork to collection
│   ├── layouts/                 # Layout components
│   │   ├── header.tsx           # App header
│   │   └── footer.tsx           # App footer
│   └── ui/                      # Base UI components (shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── checkbox.tsx
│       ├── confirmDialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       ├── textarea.tsx
│       └── themeToggle.tsx
├── lib/
│   ├── api/                     # API layer
│   │   ├── client.ts            # Fetch wrapper with retry logic
│   │   └── artworks.ts          # Met Museum API functions
│   ├── constants/               # App constants
│   │   ├── config.ts            # Configuration constants
│   │   └── query-keys.ts        # React Query keys
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-artwork-search.ts   # Infinite scroll search
│   │   ├── use-artwork-detail.ts   # Artwork details
│   │   ├── useDepartments.ts      # Departments list
│   │   ├── useFeaturedArtworks.ts # Featured artworks
│   │   ├── useSimilarArtworks.ts  # Similar artworks
│   │   └── useTheme.ts            # Theme management
│   ├── providers/               # React providers
│   │   └── query-provider.tsx   # React Query provider
│   ├── stores/                  # Zustand stores
│   │   ├── collections-store.ts # Collections with persistence
│   │   ├── searchStore.ts      # Search state
│   │   └── searchHistoryStore.ts # Search history
│   ├── types/                   # TypeScript types
│   │   └── artwork.ts           # Met API type definitions
│   └── utils/                   # Utility functions
│       ├── cn.ts                # Class name merger
│       ├── formatters.ts        # Data formatters
│       └── sanitize.ts          # HTML sanitization utilities
├── stories/                     # Storybook stories
│   ├── ArtworkCard.stories.tsx
│   ├── ArtworkGrid.stories.tsx
│   ├── EmptyState.stories.tsx
│   └── ErrorState.stories.tsx
├── __tests__/                   # Test files
│   ├── components/
│   ├── stores/
│   └── utils/
├── .storybook/                  # Storybook config
│   └── main.ts                  # Storybook configuration (Next.js Vite)
├── .cursorrules                 # Project coding standards
├── jest.config.js               # Jest configuration
├── jest.setup.ts                # Jest setup
├── vitest.config.ts            # Vitest configuration
├── tsconfig.json                # TypeScript config
└── tsconfig.test.json           # TypeScript config for tests
```

## 🔑 Key Technical Decisions

### 1. Next.js App Router vs Pages Router
**Decision**: Use App Router  
**Rationale**: 
- Better performance with React Server Components
- Improved data fetching patterns
- Built-in loading and error states
- Better SEO with automatic metadata
- Future-proof architecture

### 2. React Query for Server State
**Decision**: Use @tanstack/react-query instead of SWR  
**Rationale**:
- More powerful caching strategies
- Built-in infinite scroll support (`useInfiniteQuery`)
- Better TypeScript support
- Excellent dev tools
- More granular control over refetching

### 3. Zustand vs Redux for Client State
**Decision**: Use Zustand  
**Rationale**:
- Minimal boilerplate (90% less code than Redux)
- Built-in persistence middleware
- No context provider needed
- Better TypeScript inference
- Smaller bundle size (~3KB vs ~20KB)

### 4. Batch Fetching Strategy
**Decision**: Fetch artwork IDs first, then batch fetch details  
**Rationale**:
- Met API returns all matching IDs upfront
- Batch fetching prevents rate limiting (80 req/sec limit)
- Better control over pagination
- Graceful degradation if some items fail

**Implementation**:
```typescript
// Get IDs from search
const { objectIDs } = await searchArtworks(query)

// Batch fetch page worth of details
const pageIds = objectIDs.slice(start, end)
const artworks = await Promise.all(
  pageIds.map(id => getArtworkById(id).catch(() => null))
)
```

### 5. Infinite Scroll Implementation
**Decision**: Intersection Observer with React Query  
**Rationale**:
- Native browser API (no dependencies)
- Better performance than scroll listeners
- Automatic cleanup
- Works with React Query's `useInfiniteQuery`

### 6. Type Safety Approach
**Decision**: Strict TypeScript with comprehensive API types  
**Rationale**:
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring
- Generated from actual API responses

### 7. Accessibility First
**Decision**: Build accessibility in from the start  
**Implementation**:
- Semantic HTML elements
- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Enter, Escape)
- Focus management
- Screen reader announcements for dynamic content

## ⚖️ Trade-offs & Future Improvements

### Trade-offs

1. **No Virtualization**
   - **Trade-off**: Render all loaded items in DOM
   
2. **No Image Optimization Pipeline**
   - **Trade-off**: Using Met's images directly

3. **No User Authentication**
   - **Trade-off**: Collections only stored locally

4. **No advanced logging service for debugging, like Sentry**
   - **Trade-off**: 

5. **No search bar in collections**
   - **Trade-off**: If user has many collections, it can take a while to find all

6. **No e2e tests**
   - **Trade-off**: No testing of all application flows

### Improvements

- [ ] Add share functionality (social media, link sharing)
- [ ] Virtual scrolling for better performance
- [ ] Export collections (PDF, JSON)
- [ ] Timeline view for artworks
- [ ] Multi-language support

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Test Coverage

- **Unit Tests**: Utility functions, formatters (Jest)
- **Component Tests**: UI components with user interactions (Jest + React Testing Library)
- **Store Tests**: Zustand store actions and state updates (Jest)
- **Storybook Tests**: Component tests via Vitest addon

## 📚 Storybook

### Running Storybook

```bash
npm run storybook
```

Visit [http://localhost:6006](http://localhost:6006)

### What's Documented

1. **Feature Components**: ArtworkCard, ArtworkGrid, EmptyState, ErrorState
2. **All Visual States**: Default, Loading, Error, Empty, With Data
3. **Interactive Controls**: Modify props in real-time
4. **Vitest Integration**: Run component tests directly in Storybook

## 🎯 Performance Optimizations

### Implemented

1. **React Query Caching**: 5-minute stale time, aggressive caching
2. **Debounced Search**: 600ms debounce to reduce API calls
3. **Image Lazy Loading**: Below-the-fold images load on demand
4. **Code Splitting**: Dynamic imports for large components
5. **Optimistic UI**: Instant feedback for collection updates
6. **Request Deduplication**: Prevents duplicate API calls
7. **Skeleton Screens**: Better perceived performance
8. **Image Viewer**: Modal for viewing high-resolution artwork images
9. **Similar Artworks**: Carousel showing related artworks
10. **Featured Artworks**: Curated featured collection on homepage
11. **Search History**: Persistent search history with Zustand
12. **Theme Toggle**: Dark/light mode support
13. **BFF (Backend for Frontend)** pattern