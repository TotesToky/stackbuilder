module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@hooks': './src/hooks',
          '@store': './src/store',
          '@services': './src/services',
          '@data': './src/data',
          '@utils': './src/utils',
          '@assets': './src/assets',
          '@navigation': './src/navigation',
          '@constants': './src/constants',
          '@types': './src/types',
          '@context': './src/context',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
