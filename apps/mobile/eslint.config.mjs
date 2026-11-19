import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';

export default defineConfig([
  expoConfig,
  {
    ignores: ['dist/**', '.expo/**'],
  },
  {
    rules: {
      // React Compiler rules are useful but too noisy for the current mobile codebase.
      // Re-enable incrementally as components are refactored.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@react-native-community/datetimepicker',
              message:
                'Import DateTimePicker from @/components/native/date-time-picker. Older store builds lack the native module and crash on import.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@react-native-community/datetimepicker',
              message:
                'Import DateTimePicker from @/components/native/date-time-picker. Older store builds lack the native module and crash on import.',
            },
            {
              name: '@/lib/mobile-error-reporter',
              importNames: [
                'createSchoolAdminErrorReporter',
                'createParentPortalErrorReporter',
                'createTeacherPortalErrorReporter',
              ],
              message:
                'Use useMobileErrorReporter from @/lib/use-mobile-error-reporter in components.',
            },
          ],
        },
      ],
    },
  },
  {
    // The one sanctioned loader for the native date picker.
    files: ['src/components/native/date-time-picker.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]);
