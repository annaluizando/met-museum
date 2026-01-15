import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../app/globals.css';

// Create a QueryClient instance for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper component to provide React Query context
const withQueryProvider = (Story: React.ComponentType) => (
  <QueryClientProvider client={queryClient}>
    <Story />
  </QueryClientProvider>
);

// Wrapper component to handle theme class on html element
const withTheme = (Story: React.ComponentType) => {
  // Initialize theme on mount
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') || 'system';
    const root = document.documentElement;
    
    if (stored === 'dark') {
      root.classList.add('dark');
    } else if (stored === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }

  return <Story />;
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: 'requiredFirst',
    },
    actions: {
      argTypesRegex: '^on[A-Z].*',
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0a0a0a',
        },
      ],
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
      options: {
        checks: { 'color-contrast': { options: { noScroll: true } } },
      },
    },
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
      },
    },
  },
  decorators: [withTheme, withQueryProvider],
};

export default preview;