import { Dimensions } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const GAME_CONFIG = {
  INITIAL_BLOCK_WIDTH: 100,
  INITIAL_BLOCK_HEIGHT: 20,
  INITIAL_SPEED: 2,
  SPEED_INCREASE: 0.3,
  WIDTH_DECREASE: 0.8,
  PERFECT_THRESHOLD: 5,
  MAX_BLOCKS: 50,
  GRAVITY: 0.5,
};

export const SCREEN_CONFIG = {
  WIDTH: SCREEN_WIDTH,
  HEIGHT: SCREEN_HEIGHT,
  GAME_AREA_HEIGHT: SCREEN_HEIGHT * 0.8,
  GAME_AREA_WIDTH: SCREEN_WIDTH,
};

export const COLORS = {
  PRIMARY: '#FF6B6B',
  SECONDARY: '#4ECDC4',
  ACCENT: '#45B7D1',
  SUCCESS: '#96CEB4',
  WARNING: '#FFEAA7',
  ERROR: '#DDA0DD',
  BACKGROUND: '#2C3E50',
  TEXT: '#FFFFFF',
  TEXT_DARK: '#34495E',
};

export const SKINS = [
  {
    id: 'default',
    name: 'Classic',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    price: 0,
    unlocked: true,
  },
  {
    id: 'neon',
    name: 'Neon',
    colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0080'],
    price: 100,
    unlocked: false,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#0066CC', '#0099CC', '#00CCCC', '#66CCFF'],
    price: 150,
    unlocked: false,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#FF6B35', '#F7931E', '#FFD23F', '#FF8C42'],
    price: 200,
    unlocked: false,
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    colors: ['#8B00FF', '#4B0082', '#9400D3', '#DA70D6'],
    price: 300,
    unlocked: false,
  },
];

// export const AD_CONFIG = {
//   appOpenAdId: __DEV__ ? TestIds.APP_OPEN : 'ca-app-pub-3940256099942544/2104109211',
//   rewardedAdId: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3940256099942544/7100986512',
//   interstitialAdId: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3940256099942544/8190115329',
//   bannerAdId: __DEV__ ? TestIds.BANNER : 'ca-app-pub-3940256099942544/5198741234',
// };
export const AD_CONFIG = {
  appOpenAdId: TestIds.APP_OPEN,
  rewardedAdId: TestIds.REWARDED,
  interstitialAdId: TestIds.INTERSTITIAL,
  bannerAdId: TestIds.BANNER,
};

// export const SOUNDS = {
//   DROP: require('@assets/sounds/drop.mp3'),
//   PERFECT: require('@assets/sounds/perfect.mp3'),
//   GAME_OVER: require('@assets/sounds/game_over.mp3'),
//   BACKGROUND_MUSIC: require('@assets/sounds/background_music.mp3'),
// };

export const SOUNDS = {
  DROP: '',
  PERFECT: '',
  GAME_OVER: '',
  BACKGROUND_MUSIC: '',
};