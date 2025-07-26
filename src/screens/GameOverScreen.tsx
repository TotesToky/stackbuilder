import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { useGame } from '@/context/GameContext';
import SoundService from '@/services/SoundService';
import AdService from '@/services/AdService';

type GameOverScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GameOver'>;
type GameOverScreenRouteProp = RouteProp<RootStackParamList, 'GameOver'> & {
  params: {
    score: number;
    highScore: number;
    blockX: number;
    blockY: number;
  };
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GameOverScreen: React.FC = () => {
  const navigation = useNavigation<GameOverScreenNavigationProp>();
  const route = useRoute<GameOverScreenRouteProp>();
  const { dispatch, gameState, userSettings } = useGame();
  const { score, highScore } = route.params;
  const isNewHighScore = score === highScore && score > 0;

  const titleScale = useSharedValue(0);
  const scoreScale = useSharedValue(0);
  const buttonScale = useSharedValue(0);

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    titleScale.value = withSpring(1, { damping: 8 });
    scoreScale.value = withDelay(300, withSpring(1, { damping: 8 }));
    buttonScale.value = withDelay(600, withSpring(1, { damping: 8 }));

    if (isNewHighScore) {
      titleScale.value = withSequence(
        withSpring(1),
        withSpring(1.2),
        withSpring(1)
      );
    }
  };

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
    navigation.navigate('Game');
  };

  const handleMainMenu = () => {
    navigation.navigate('MainMenu');
  };

  const handleContinueWithAd = () => {
    if (AdService.isRewardedAdLoaded()) {
      AdService.showRewardedAd().then((rewarded) => {
        if (rewarded) {
          dispatch({ 
            type: 'CONTINUE_GAME', 
            payload: { 
              blockX: gameState.currentBlock.x, 
              blockY: gameState.currentBlock.y 
            }
          });
          navigation.navigate('Game');
        }
      });
    } else {
      Alert.alert('Ad Not Available', 'Please try again later.');
    }
  };

  const animatedTitleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: titleScale.value }],
    };
  });

  const animatedScoreStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scoreScale.value }],
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return (
    <LinearGradient
      colors={[COLORS.BACKGROUND, COLORS.ERROR]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.Text style={[styles.title, animatedTitleStyle]}>
          {isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER'}
        </Animated.Text>

        <Animated.View style={[styles.scoreContainer, animatedScoreStyle]}>
          <Text style={styles.scoreLabel}>Final Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
          
          {!isNewHighScore && (
            <View style={styles.highScoreContainer}>
              <Text style={styles.highScoreLabel}>High Score</Text>
              <Text style={styles.highScoreValue}>{highScore}</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
          <TouchableOpacity
            style={[styles.button, styles.playAgainButton]}
            onPress={handlePlayAgain}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={24} color={COLORS.TEXT} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>PLAY AGAIN</Text>
          </TouchableOpacity>

          {AdService.isRewardedAdLoaded() && (
            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={handleContinueWithAd}
              activeOpacity={0.8}
            >
              <Ionicons name="play-forward" size={24} color={COLORS.TEXT} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>CONTINUE (AD)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.menuButton]}
            onPress={handleMainMenu}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={24} color={COLORS.TEXT} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>MAIN MENU</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {userSettings.adsEnabled && (
        <View style={styles.adContainer}>
          <BannerAd
            unitId={AdService.getBannerAdId()}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: 40,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  scoreLabel: {
    fontSize: 18,
    color: COLORS.TEXT,
    opacity: 0.8,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 20,
  },
  highScoreContainer: {
    alignItems: 'center',
  },
  highScoreLabel: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.6,
  },
  highScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: SCREEN_WIDTH * 0.7,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
  },
  playAgainButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  continueButton: {
    backgroundColor: COLORS.WARNING,
  },
  menuButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  buttonIcon: {
    marginRight: 10,
  },
  adContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
});

export default GameOverScreen;