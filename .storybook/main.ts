import type { StorybookConfig } from '@storybook/nextjs-vite';
import { mergeConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {
      nextConfigPath: path.resolve(__dirname, '../next.config.ts'),
    },
  },
  staticDirs: ["../public"],
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  async viteFinal(config) {
    // Prevent duplicate preview processing
    const existingAlias = config.resolve?.alias || {};
    const aliasArray = Array.isArray(existingAlias) 
      ? existingAlias 
      : Object.entries(existingAlias).map(([key, value]) => ({ find: key, replacement: value as string }));

    return mergeConfig(config, {
      esbuild: {
        jsx: 'automatic',
      },
      optimizeDeps: {
        esbuildOptions: {
          jsx: 'automatic',
        },
        include: ['react', 'react-dom'],
        exclude: [],
      },
      resolve: {
        alias: [
          ...aliasArray,
          {
            find: '@',
            replacement: path.resolve(__dirname, '../'),
          },
        ],
        dedupe: ['react', 'react-dom'],
      },
      build: {
        commonjsOptions: {
          include: [/node_modules/],
        },
      },
      server: {
        fs: {
          strict: false,
        },
      },
    });
  },
};

export default config;