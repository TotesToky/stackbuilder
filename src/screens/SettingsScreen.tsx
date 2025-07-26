import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { useGame } from '@/context/GameContext';
import SoundService from '@/services/SoundService';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import AdService from '@/services/AdService';

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { userSettings, updateSettings, gameStats, resetAllData } = useGame();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSoundToggle = (enabled: boolean) => {
    updateSettings({ soundEnabled: enabled });
    SoundService.setSoundEnabled(enabled);
  };

  const handleMusicToggle = (enabled: boolean) => {
    updateSettings({ musicEnabled: enabled });
    SoundService.setMusicEnabled(enabled);
  };

  const handleVibrationToggle = (enabled: boolean) => {
    updateSettings({ vibrationEnabled: enabled });
  };

  const handleAdsToggle = (enabled: boolean) => {
    updateSettings({ adsEnabled: enabled });
  };

  const handleResetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all game statistics? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Alert.alert('Success', 'Statistics have been reset.');
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: COLORS.SUCCESS }}
        thumbColor={value ? COLORS.TEXT : '#f4f3f4'}
      />
    </View>
  );

  return (
    <LinearGradient
      colors={[COLORS.BACKGROUND, COLORS.ACCENT]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          
          {renderSettingItem(
            'Sound Effects',
            'Enable sound effects during gameplay',
            userSettings.soundEnabled,
            handleSoundToggle
          )}
          
          {renderSettingItem(
            'Background Music',
            'Play background music during gameplay',
            userSettings.musicEnabled,
            handleMusicToggle
          )}
          
          {renderSettingItem(
            'Vibration',
            'Enable haptic feedback',
            userSettings.vibrationEnabled,
            handleVibrationToggle
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monetization</Text>
          
          {renderSettingItem(
            'Advertisements',
            'Show ads to support the game',
            userSettings.adsEnabled,
            handleAdsToggle
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Statistics</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Games Played:</Text>
              <Text style={styles.statValue}>{gameStats.gamesPlayed}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>High Score:</Text>
              <Text style={styles.statValue}>{gameStats.highScore}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Score:</Text>
              <Text style={styles.statValue}>{gameStats.totalScore}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Perfect Hits:</Text>
              <Text style={styles.statValue}>{gameStats.perfectHits}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Best Combo:</Text>
              <Text style={styles.statValue}>{gameStats.bestCombo}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetStats}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={20} color={COLORS.TEXT} style={styles.resetIcon} />
            <Text style={styles.resetButtonText}>Reset Statistics</Text>
          </TouchableOpacity>
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
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingText: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: COLORS.TEXT,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ERROR,
    padding: 15,
    borderRadius: 10,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  resetIcon: {
    marginRight: 10,
  },
  adContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
});

export default SettingsScreen;