module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@components': './src/components',
          '@utils': './src/utils',
          '@screens': './src/screens',
          '@styles': './src/styles',
          '@assets': './src/assets',
          '@store': './src/store',
          '@services': './src/services',
          '@navigation': './src/navigation',
          // Add more aliases if needed:
          // '@assets': './src/assets',
          // '@features': './src/features',
          // '@states': './src/states',
        },
      },
    ],
    'react-native-reanimated/plugin', // MUST be last
  ],
};
