import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { useGame } from '@/context/GameContext';
import SoundService from '@/services/SoundService';
import AdService from '@/services/AdService';

type MainMenuNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MainMenuScreen: React.FC = () => {
  const navigation = useNavigation<MainMenuNavigationProp>();
  const { gameState, gameStats, userSettings, isLoading, resetGame, skins } = useGame();
  const buttonScale = useSharedValue(1);
  const titleScale = useSharedValue(1);

  // Trouver le skin actif
  const activeSkin = skins.find(skin => skin.id === userSettings.selectedSkin);

  useEffect(() => {
    if (userSettings.musicEnabled) {
      SoundService.playMusic();
    }

    titleScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 8 }),
        withSpring(1, { damping: 8 })
      ),
      -1,
      true
    );
    
    // Réinitialiser le jeu au montage
    resetGame();
  }, []);

  if (isLoading) {
    return (
      <LinearGradient
        colors={[COLORS.BACKGROUND, COLORS.PRIMARY]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  const handlePlayPress = () => {
    if (userSettings.soundEnabled) {
      SoundService.playSound('drop');
    }
    navigation.navigate('Game');
  };

  const handleSkinShopPress = () => {
    if (userSettings.soundEnabled) {
      SoundService.playSound('drop');
    }
    navigation.navigate('SkinShop');
  };

  const handleSettingsPress = () => {
    if (userSettings.soundEnabled) {
      SoundService.playSound('drop');
    }
    navigation.navigate('Settings');
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: titleScale.value }],
    };
  });

  return (
    <LinearGradient
      colors={[COLORS.BACKGROUND, COLORS.PRIMARY]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.Text style={[styles.title, animatedTitleStyle]}>
          Stack Builder
        </Animated.Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>High Score</Text>
            <Text style={styles.statValue}>{gameStats.highScore}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Games Played</Text>
            <Text style={styles.statValue}>{gameStats.gamesPlayed}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.playButton]}
            onPress={handlePlayPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>PLAY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSkinShopPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>SKINS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSettingsPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>SETTINGS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.skinPreview}>
          <Text style={styles.skinPreviewText}>
            Current Skin: {activeSkin ? activeSkin.name : userSettings.selectedSkin}
          </Text>
          <View style={styles.skinPreviewBlocks}>
            {activeSkin?.colors.map((color, index) => (
              <View
                key={index}
                style={[
                  styles.previewBlock,
                  { 
                    backgroundColor: color,
                    width: 40 - index * 5 
                  }
                ]}
              />
            ))}
          </View>
        </View>
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
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'System',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.8,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  button: {
    width: SCREEN_WIDTH * 0.6,
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
  },
  playButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  secondaryButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  skinPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  skinPreviewText: {
    fontSize: 16,
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  skinPreviewBlocks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewBlock: {
    height: 10,
    marginHorizontal: 2,
    borderRadius: 5,
  },
  adContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.TEXT,
    fontWeight: 'bold',
  },
});

export default MainMenuScreen;