/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/global\\.css$': '<rootDir>/test/style-mock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css)$': '<rootDir>/test/style-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/'],
};
