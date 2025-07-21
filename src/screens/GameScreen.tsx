import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { useGame } from '@/context/GameContext';
import GameEngine from '@/components/GameEngine';
import SoundService from '@/services/SoundService';
import AdService from '@/services/AdService';

type GameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GameScreen: React.FC = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const { gameState, dispatch, gameStats, updateGameStats, userSettings, saveGameSession } = useGame();
  const pauseButtonScale = useSharedValue(1);
  const gameOverHandled = useRef(false);
  const gameStartTime = useRef(Date.now());
  const [gameOverPosition, setGameOverPosition] = useState<{ x: number; y: number } | null>(null);
  
  const headerHeight = 120;
  const instructionsHeight = 60;
  const gameAreaHeight = SCREEN_HEIGHT - headerHeight - instructionsHeight;

  useEffect(() => {
    gameStartTime.current = Date.now();
    if (userSettings.musicEnabled) {
      SoundService.playMusic();
    }

    return () => {
      if (userSettings.musicEnabled) {
        SoundService.pauseMusic();
      }
    };
  }, []);

  useEffect(() => {
    if (gameState.isGameOver && !gameOverHandled.current && gameOverPosition) {
      gameOverHandled.current = true;
      handleGameOver();
    }
  }, [gameState.isGameOver, gameOverPosition]);

  // Correction : Réinitialiser la position quand le jeu reprend
  useEffect(() => {
    if (!gameState.isGameOver) {
      gameOverHandled.current = false;
      setGameOverPosition(null);
    }
  }, [gameState.isGameOver]);

  const handleGameOver = async () => {
    const gameDuration = Math.floor((Date.now() - gameStartTime.current) / 1000);
    
    // Save game session to database
    await saveGameSession({
      score: gameState.score,
      level: gameState.level,
      perfectHits: gameState.perfectHits,
      combo: gameState.combo,
      duration: gameDuration,
      skinUsed: userSettings.selectedSkin,
    });

    // Update stats
    const newStats = {
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalScore: gameStats.totalScore + gameState.score,
      highScore: Math.max(gameStats.highScore, gameState.score),
      perfectHits: gameStats.perfectHits + gameState.perfectHits,
      averageScore: (gameStats.totalScore + gameState.score) / (gameStats.gamesPlayed + 1),
      bestCombo: Math.max(gameStats.bestCombo, gameState.combo),
    };

    await updateGameStats(newStats);

    // Show interstitial ad
    await AdService.showInterstitial();

    // Navigate to game over screen with position
    navigation.replace('GameOver', {
      score: gameState.score,
      highScore: newStats.highScore,
      blockX: gameOverPosition!.x,
      blockY: gameOverPosition!.y,
    });
  };

  const handleGameOverWithPosition = (position: { x: number; y: number }) => {
    setGameOverPosition(position);
  };

  const handlePausePress = () => {
    if (gameState.isPaused) {
      dispatch({ type: 'RESUME_GAME' });
      if (userSettings.musicEnabled) {
        SoundService.resumeMusic();
      }
    } else {
      dispatch({ type: 'PAUSE_GAME' });
      if (userSettings.musicEnabled) {
        SoundService.pauseMusic();
      }
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      'Quit Game',
      'Are you sure you want to quit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quit', onPress: () => navigation.navigate('MainMenu') },
      ]
    );
  };

  const animatedPauseButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pauseButtonScale.value }],
    };
  });

  return (
    <LinearGradient
      colors={[COLORS.BACKGROUND, COLORS.PRIMARY]}
      style={styles.container}
    >
      {/* Game Header */}
      <View style={[styles.header, { height: headerHeight }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{gameState.score}</Text>
        </View>

        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>Level</Text>
          <Text style={styles.levelValue}>{gameState.level}</Text>
        </View>

        <Animated.View style={animatedPauseButtonStyle}>
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={handlePausePress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {gameState.isPaused ? '▶' : '⏸'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Combo Display */}
      {gameState.combo > 0 && (
        <View style={styles.comboContainer}>
          <Text style={styles.comboText}>Combo x{gameState.combo}</Text>
        </View>
      )}

      {/* Game Engine */}
      <View style={[styles.gameArea, { height: gameAreaHeight }]}>
        <GameEngine 
          availableHeight={gameAreaHeight} 
          onGameOver={handleGameOverWithPosition}
        />
      </View>

      {/* Pause Overlay */}
      {gameState.isPaused && (
        <View style={[styles.pauseOverlay, { height: gameAreaHeight }]}>
          <Text style={styles.pauseText}>PAUSED</Text>
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={handlePausePress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Instructions */}
      <View style={[styles.instructionsContainer, { height: instructionsHeight }]}>
        <Text style={styles.instructionsText}>Tap to drop the block!</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.8,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.WARNING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  comboContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  comboText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
  },
  gameArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  pauseOverlay: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 20,
  },
  resumeButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 25,
  },
  instructionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: COLORS.TEXT,
    opacity: 0.8,
  },
});

export default GameScreen;