import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { useGame } from '@/context/GameContext';
import SoundService from '@/services/SoundService';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import AdService from '@/services/AdService';

type SkinShopNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SkinShop'>;

const SkinShopScreen: React.FC = () => {
  const navigation = useNavigation<SkinShopNavigationProp>();
  const { gameStats, userSettings, updateSettings, unlockSkin, skins, updateGameStats } = useGame();
  const [selectedSkin, setSelectedSkin] = useState(userSettings.selectedSkin);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSkinSelect = (skinId: string) => {
    const skin = skins.find(s => s.id === skinId);
    if (!skin) return;

    if (skin.unlocked) {
      setSelectedSkin(skinId);
      updateSettings({ selectedSkin: skinId });
      SoundService.playSound('drop');
      navigation.goBack();
      navigation.navigate('MainMenu');
    } else {
      handleSkinPurchase(skin);
    }
  };

  const handleSkinPurchase = (skin: any) => {
    if (gameStats.totalScore >= skin.price) {
      Alert.alert(
        'Purchase Skin',
        `Are you sure you want to unlock "${skin.name}" for ${skin.price} points?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Purchase',
            onPress: async () => {
              const newTotalScore = gameStats.totalScore - skin.price;
              await updateGameStats({ totalScore: newTotalScore });
              await unlockSkin(skin.id);
              setSelectedSkin(skin.id);
              await updateSettings({ selectedSkin: skin.id });
              SoundService.playSound('perfect');
              navigation.goBack();
              navigation.navigate('MainMenu');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Insufficient Points',
        `You need ${skin.price - gameStats.totalScore} more points to unlock this skin.`
      );
    }
  };

  const renderSkinItem = (skin: any) => {
    const isSelected = selectedSkin === skin.id;
    const canAfford = gameStats.totalScore >= skin.price;

    return (
      <TouchableOpacity
        key={skin.id}
        style={[
          styles.skinItem,
          isSelected && styles.selectedSkinItem,
          !skin.unlocked && !canAfford && styles.disabledSkinItem,
        ]}
        onPress={() => handleSkinSelect(skin.id)}
        activeOpacity={0.8}
      >
        <View style={styles.skinPreview}>
          {skin.colors.map((color: string, index: number) => (
            <View
              key={index}
              style={[
                styles.colorBlock,
                { backgroundColor: color },
                { width: 60 - index * 5 },
              ]}
            />
          ))}
        </View>
        
        <Text style={styles.skinName}>{skin.name}</Text>
        
        {!skin.unlocked && (
          <View style={styles.priceContainer}>
            <Ionicons name="pricetag" size={16} color={COLORS.TEXT} style={styles.priceIcon} />
            <Text
              style={[
                styles.priceText,
                !canAfford && styles.insufficientText,
              ]}
            >
              {skin.price} pts
            </Text>
          </View>
        )}
        
        {skin.unlocked && (
          <Text style={styles.unlockedText}>
            {isSelected ? (
              <>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} /> SELECTED
              </>
            ) : (
              <>
                <Ionicons name="lock-open" size={16} color={COLORS.SUCCESS} /> UNLOCKED
              </>
            )}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[COLORS.BACKGROUND, COLORS.SECONDARY]}
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
        
        <Text style={styles.title}>Skin Shop</Text>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Points</Text>
          <Text style={styles.pointsValue}>{gameStats.totalScore}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.skinsContainer}>
          {skins.map(renderSkinItem)}
        </View>
      </ScrollView>

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
  pointsContainer: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.8,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  scrollView: {
    flex: 1,
  },
  skinsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skinItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSkinItem: {
    borderColor: COLORS.SUCCESS,
    backgroundColor: 'rgba(150, 206, 180, 0.2)',
  },
  disabledSkinItem: {
    opacity: 0.5,
  },
  skinPreview: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 15,
  },
  colorBlock: {
    height: 10,
    marginBottom: 3,
    borderRadius: 5,
  },
  skinName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WARNING,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  priceIcon: {
    marginRight: 5,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  insufficientText: {
    color: COLORS.ERROR,
  },
  unlockedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
});

export default SkinShopScreen;