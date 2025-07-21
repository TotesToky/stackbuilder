import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import AdService from '@/services/AdService';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  // Animations
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleY = useSharedValue(100);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo
    logoScale.value = withSpring(1, { damping: 8 });
    logoOpacity.value = withSpring(1);

    // Title
    titleY.value = withDelay(400, withSpring(0));
    titleOpacity.value = withDelay(400, withSpring(1));

    // Navigation + pub après un petit délai
    setTimeout(() => {
      runOnJS(navigateToMainMenu)();
    }, 2500);
  }, []);

  const navigateToMainMenu = async () => {
  try {
      await AdService.showAppOpenAd();
    } catch (error) {
      // Optionnel : log ou gestion si la pub échoue
      console.log("AppOpenAd not shown:", error);
    } finally {
      navigation.replace('MainMenu');
    }
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));

  return (
    <LinearGradient colors={[COLORS.BACKGROUND, COLORS.PRIMARY]} style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoBlock} />
          <View style={[styles.logoBlock, { backgroundColor: COLORS.SECONDARY }]} />
          <View style={[styles.logoBlock, { backgroundColor: COLORS.ACCENT }]} />
        </Animated.View>

        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          Stack Builder
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, titleAnimatedStyle]}>
          Loading...
        </Animated.Text>

        <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBlock: {
    width: 80,
    height: 20,
    backgroundColor: COLORS.PRIMARY,
    marginBottom: 5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT,
    opacity: 0.7,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 30,
  },
});

export default SplashScreen;
