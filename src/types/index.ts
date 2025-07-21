export interface GameState {
  score: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
  currentBlock: Block;
  blocks: Block[];
  combo: number;
  perfectHits: number;
  highScore: number;
}

export interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speed: number;
  direction: 'left' | 'right';
}

export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  selectedSkin: string;
  adsEnabled: boolean;
}

export interface Skin {
  id: string;
  name: string;
  colors: string[];
  price: number;
  unlocked: boolean;
  previewAnimation?: string;
}

export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  highScore: number;
  perfectHits: number;
  averageScore: number;
  bestCombo: number;
}

export interface AdConfig {
  rewardedAdId: string;
  interstitialAdId: string;
  bannerAdId: string;
  testIds: {
    rewardedAdId: string;
    interstitialAdId: string;
    bannerAdId: string;
  };
}

export interface SoundEffect {
  drop: any;
  perfect: any;
  gameOver: any;
  backgroundMusic: any;
}

export type RootStackParamList = {
  Splash: undefined;
  MainMenu: undefined;
  Game: undefined;
  GameOver: { score: number; highScore: number; blockX: number; blockY: number;  };
  SkinShop: undefined;
  Settings: undefined;
};

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  color: string;
  size: number;
}