# MetMuseum Explorer 🎨

A modern, accessible web application for exploring The Metropolitan Museum of Art's collection of over 470,000 artworks. Built with Next.js 15, React Query, Zustand, and TypeScript.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React Query](https://img.shields.io/badge/React%20Query-5-red)
![Zustand](https://img.shields.io/badge/Zustand-5-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Core Functionality
- **🔍 Advanced Search**: Search artworks by title, artist, culture, or time period with real-time results
- **♾️ Infinite Scroll**: Seamless pagination with automatic loading as you scroll
- **🎯 Artwork Details**: Comprehensive metadata including artist, date, medium, dimensions, and tags
- **📚 Collections Management**: Create, edit, and delete personal art collections with persistent storage
- **👁️ View Modes**: Toggle between grid and list views for optimal browsing experience
- **📱 Responsive Design**: Fully responsive from mobile to desktop

### Technical Highlights
- **Type-Safe**: Strict TypeScript with comprehensive type definitions
- **Accessible**: WCAG-compliant with proper ARIA labels and keyboard navigation
- **Performant**: Optimized with React Query caching, skeleton loaders, and code splitting
- **Well-Tested**: Unit and integration tests with Jest and React Testing Library
- **Documented**: Storybook stories for all major components
- **SEO-Friendly**: Dynamic metadata and proper semantic HTML

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
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety

### State Management
- **[@tanstack/react-query](https://tanstack.com/query)** - Server state management with caching
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Client state management with persistence

### Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Lucide React](https://lucide.dev/)** - Icon library

### Development Tools
- **[Storybook](https://storybook.js.org/)** - Component documentation
- **[Jest](https://jestjs.io/)** - Unit testing
- **[React Testing Library](https://testing-library.com/)** - Component testing
- **[ESLint](https://eslint.org/)** - Code linting

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or higher
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
│   │   └── artwork-detail-view.tsx  # Client component
│   ├── collections/             # Collections page
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (search)
│   └── globals.css              # Global styles
├── components/
│   ├── features/                # Feature-specific components
│   │   ├── artwork-card.tsx     # Artwork display card
│   │   ├── artwork-grid.tsx     # Grid with infinite scroll
│   │   ├── search-bar.tsx       # Search input with debounce
│   │   ├── collection-form.tsx  # CRUD form
│   │   ├── collection-list.tsx  # Collection management
│   │   ├── empty-state.tsx      # Empty state component
│   │   └── error-state.tsx      # Error state component
│   ├── layouts/                 # Layout components
│   │   ├── header.tsx           # App header
│   │   └── footer.tsx           # App footer
│   └── ui/                      # Base UI components (shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── skeleton.tsx
│       └── textarea.tsx
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
│   │   └── use-departments.ts      # Departments list
│   ├── providers/               # React providers
│   │   └── query-provider.tsx   # React Query provider
│   ├── stores/                  # Zustand stores
│   │   ├── collections-store.ts # Collections with persistence
│   │   └── search-store.ts      # Search state
│   ├── types/                   # TypeScript types
│   │   └── artwork.ts           # Met API type definitions
│   └── utils/                   # Utility functions
│       ├── cn.ts                # Class name merger
│       └── formatters.ts        # Data formatters
├── stories/                     # Storybook stories
│   ├── Button.stories.tsx
│   ├── ArtworkCard.stories.tsx
│   ├── EmptyState.stories.tsx
│   └── ErrorState.stories.tsx
├── __tests__/                   # Test files
│   ├── components/
│   ├── stores/
│   └── utils/
├── .storybook/                  # Storybook config
├── .cursorrules                 # Project coding standards
├── jest.config.js               # Jest configuration
├── jest.setup.js                # Jest setup
└── tsconfig.json                # TypeScript config
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

### Current Trade-offs

1. **No Virtualization**
   - **Trade-off**: Render all loaded items in DOM
   - **Impact**: Memory usage increases with many items
   - **Future**: Implement `react-virtuoso` for large lists
   
2. **No Advanced Filtering**
   - **Trade-off**: Basic search only (query string)
   - **Impact**: Can't filter by multiple criteria simultaneously
   - **Future**: Add filter UI for department, date range, medium, etc.

3. **No Image Optimization Pipeline**
   - **Trade-off**: Using Met's images directly
   - **Impact**: Inconsistent image sizes/quality
   - **Future**: Implement Next.js Image optimization with blur placeholders

4. **No Offline Support**
   - **Trade-off**: Requires internet connection
   - **Impact**: No functionality when offline
   - **Future**: Service Worker for offline caching

5. **No User Authentication**
   - **Trade-off**: Collections only stored locally
   - **Impact**: Collections don't sync across devices
   - **Future**: Add authentication and cloud storage

### Planned Improvements

#### High Priority
- [ ] Add advanced search filters UI (department, date range, medium)
- [ ] Implement artwork comparison feature
- [ ] Add share functionality (social media, link sharing)
- [ ] Implement artwork favorites/bookmarks
- [ ] Add search history

#### Medium Priority
- [ ] Virtual scrolling for better performance
- [ ] Image zoom functionality
- [ ] Export collections (PDF, JSON)
- [ ] Dark mode support
- [ ] Progressive Web App (PWA) features

#### Nice to Have
- [ ] Similar artworks recommendations
- [ ] Timeline view for artworks
- [ ] 3D/AR view for sculptures
- [ ] Multi-language support
- [ ] Print-friendly view

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

- **Unit Tests**: Utility functions, formatters
- **Component Tests**: UI components with user interactions
- **Store Tests**: Zustand store actions and state updates
- **Integration Tests**: Search flow, collection CRUD

### Testing Philosophy

1. **Accessibility First**: Use semantic queries (getByRole, getByLabelText)
2. **User Behavior**: Test how users interact, not implementation details
3. **Real Scenarios**: Test complete user flows
4. **Mock Strategically**: Mock only external dependencies (API, localStorage)

## 📚 Storybook

### Running Storybook

```bash
npm run storybook
```

Visit [http://localhost:6006](http://localhost:6006)

### What's Documented

1. **UI Components**: Button, Input, Card, Skeleton
2. **Feature Components**: ArtworkCard, EmptyState, ErrorState
3. **All Visual States**: Default, Loading, Error, Empty, With Data
4. **Interactive Controls**: Modify props in real-time
5. **Accessibility Tests**: Built-in a11y addon

## 🎯 Performance Optimizations

### Implemented

1. **React Query Caching**: 5-minute stale time, aggressive caching
2. **Debounced Search**: 300ms debounce to reduce API calls
3. **Image Lazy Loading**: Below-the-fold images load on demand
4. **Code Splitting**: Dynamic imports for large components
5. **Optimistic UI**: Instant feedback for collection updates
6. **Request Deduplication**: Prevents duplicate API calls
7. **Skeleton Screens**: Better perceived performance

### Metrics (Target)

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

## 🔒 Security Considerations

### Implemented

1. **Input Sanitization**: All user inputs validated/sanitized
2. **URL Validation**: Only HTTPS images allowed
3. **XSS Prevention**: React's built-in escaping
4. **HTTPS Only**: Enforce secure connections
5. **API Rate Limiting**: Respect Met API limits (80 req/sec)
6. **No Sensitive Data**: No API keys or secrets in client code

TODO:
- fix search
- fix image loading on full artwork page
- ensure zoom in image is working
- test collections, see if its saving locally, if they work properly
- improve search, make it have specific filters for advanced search 
- fix storybook