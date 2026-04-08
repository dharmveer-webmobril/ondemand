const path = require('path');

const src = path.resolve(__dirname, 'src');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        // Absolute paths so @aliases resolve when Metro/Xcode uses cwd = ios/
        root: [src],
        cwd: __dirname,
        alias: {
          '@components': path.join(src, 'components'),
          '@utils': path.join(src, 'utils'),
          '@screens': path.join(src, 'screens'),
          '@styles': path.join(src, 'styles'),
          '@assets': path.join(src, 'assets'),
          '@store': path.join(src, 'store'),
          '@services': path.join(src, 'services'),
          '@navigation': path.join(src, 'navigation'),
        },
      },
    ],
    'react-native-reanimated/plugin', // MUST be last
  ],
};
