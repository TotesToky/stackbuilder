import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameStats, UserSettings, Skin, Block } from '@/types';
import { SKINS } from '@/constants';
import DatabaseService from '@/services/DatabaseService';

interface GameContextType {
  gameState: GameState;
  userSettings: UserSettings;
  gameStats: GameStats;
  skins: Skin[];
  isLoading: boolean;
  dispatch: React.Dispatch<GameAction>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateGameStats: (stats: Partial<GameStats>) => Promise<void>;
  unlockSkin: (skinId: string) => Promise<void>;
  resetGame: () => void;
  saveGameSession: (sessionData: any) => Promise<void>;
  resetAllData: () => Promise<void>;
}

type GameAction =
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'ADD_BLOCK'; payload: Block }
  | { type: 'GAME_OVER' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_LEVEL'; payload: number }
  | { type: 'UPDATE_COMBO'; payload: number }
  | { type: 'SET_HIGH_SCORE'; payload: number }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'PERFECT_HIT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_SETTINGS'; payload: UserSettings }
  | { type: 'SET_GAME_STATS'; payload: GameStats }
  | { type: 'SET_SKINS'; payload: Skin[] }
  | { type: 'SET_CURRENT_BLOCK'; payload: Block }
  | { type: 'CONTINUE_GAME'; payload: { blockX: number; blockY: number } };

const initialGameState: GameState = {
  score: 0,
  level: 1,
  isGameOver: false,
  isPaused: false,
  currentBlock: {
    id: '1',
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    color: '#FF6B6B',
    speed: 2,
    direction: 'right',
  },
  blocks: [],
  combo: 0,
  perfectHits: 0,
  highScore: 0,
};

const initialUserSettings: UserSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  selectedSkin: 'default',
  adsEnabled: true,
};

const initialGameStats: GameStats = {
  gamesPlayed: 0,
  totalScore: 0,
  highScore: 0,
  perfectHits: 0,
  averageScore: 0,
  bestCombo: 0,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'UPDATE_SCORE':
      return { ...state, score: action.payload };
    case 'ADD_BLOCK':
      return { 
        ...state, 
        blocks: [...state.blocks, action.payload],
        currentBlock: initialGameState.currentBlock
      };
    case 'GAME_OVER':
      return { ...state, isGameOver: true };
    case 'RESET_GAME':
      return { ...initialGameState, highScore: state.highScore };
    case 'UPDATE_LEVEL':
      return { ...state, level: action.payload };
    case 'UPDATE_COMBO':
      return { ...state, combo: action.payload };
    case 'SET_HIGH_SCORE':
      return { ...state, highScore: action.payload };
    case 'PAUSE_GAME':
      return { ...state, isPaused: true };
    case 'RESUME_GAME':
      return { ...state, isPaused: false };
    case 'PERFECT_HIT':
      return { ...state, perfectHits: state.perfectHits + 1 };
    case 'SET_CURRENT_BLOCK':
      return { ...state, currentBlock: action.payload };
    // Correction : Préserver toutes les propriétés du bloc
    case 'CONTINUE_GAME':
      return { 
        ...state, 
        isGameOver: false,
        currentBlock: {
          ...state.currentBlock,
          x: action.payload.blockX,
          y: action.payload.blockY
        }
      };
    default:
      return state;
  }
};

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [userSettings, setUserSettings] = React.useState<UserSettings>(initialUserSettings);
  const [gameStats, setGameStats] = React.useState<GameStats>(initialGameStats);
  const [skins, setSkins] = React.useState<Skin[]>(SKINS);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      setIsLoading(true);
      await DatabaseService.initializeDatabase();
      await loadGameData();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const loadGameData = async () => {
    try {
      const [settings, stats, skinsData] = await Promise.all([
        DatabaseService.getUserSettings(),
        DatabaseService.getGameStats(),
        DatabaseService.getSkins(),
      ]);

      setUserSettings(settings);
      setGameStats(stats);
      setSkins(skinsData);
      dispatch({ type: 'SET_HIGH_SCORE', payload: stats.highScore });
    } catch (error) {
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    try {
      await DatabaseService.updateUserSettings(settings);
      const updatedSettings = await DatabaseService.getUserSettings();
      setUserSettings(updatedSettings);
    } catch (error) {
      setUserSettings(prev => ({ ...prev, ...settings }));
    }
  };

  const updateGameStats = async (stats: Partial<GameStats>) => {
    try {
      await DatabaseService.updateGameStats(stats);
      const updatedStats = await DatabaseService.getGameStats();
      setGameStats(updatedStats);
      
      if (stats.highScore !== undefined) {
        dispatch({ type: 'SET_HIGH_SCORE', payload: stats.highScore });
      }
    } catch (error) {
      const newStats = { ...gameStats, ...stats };
      setGameStats(newStats);
      if (stats.highScore !== undefined) {
        dispatch({ type: 'SET_HIGH_SCORE', payload: stats.highScore });
      }
    }
  };

  const unlockSkin = async (skinId: string) => {
    try {
      await DatabaseService.unlockSkin(skinId);
      const updatedSkins = await DatabaseService.getSkins();
      setSkins(updatedSkins);
    } catch (error) {
      setSkins(prev => prev.map(skin => 
        skin.id === skinId ? { ...skin, unlocked: true } : skin
      ));
    }
  };

  const saveGameSession = async (sessionData: {
    score: number;
    level: number;
    perfectHits: number;
    combo: number;
    duration: number;
    skinUsed: string;
  }) => {
    try {
      await DatabaseService.saveGameSession(sessionData);
    } catch (error) {
    }
  };

  const resetAllData = async () => {
    try {
      await DatabaseService.resetAllData();
      await loadGameData();
      dispatch({ type: 'RESET_GAME' });
    } catch (error) {
    }
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        userSettings,
        gameStats,
        skins,
        isLoading,
        dispatch,
        updateSettings,
        updateGameStats,
        unlockSkin,
        resetGame,
        saveGameSession,
        resetAllData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
};