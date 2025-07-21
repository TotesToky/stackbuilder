import mobileAds, { 
  InterstitialAd, 
  RewardedAd, 
  BannerAd, 
  BannerAdSize, 
  TestIds, 
  AdEventType,
  RewardedAdEventType,
  AppOpenAd,
  AdEventType as AppOpenAdEventType
} from 'react-native-google-mobile-ads';
import { AD_CONFIG } from '@/constants';

class AdService {
  private interstitialAd!: InterstitialAd;
  private rewardedAd!: RewardedAd;
  private appOpenAd!: AppOpenAd;
  private interstitialLoaded: boolean = false;
  private rewardedLoaded: boolean = false;
  private appOpenLoaded: boolean = false;
  private gamesSinceLastAd: number = 0;

  constructor() {
    this.initializeAds();
  }

  private async initializeAds() {
    try {
      await mobileAds().initialize();
      this.initializeInterstitial();
      this.initializeRewarded();
      this.initializeAppOpen();
    } catch (error) {
      console.error('Failed to initialize ads:', error);
    }
  }

  private initializeInterstitial() {
    this.interstitialAd = InterstitialAd.createForAdRequest(
      AD_CONFIG.interstitialAdId,
      {
        requestNonPersonalizedAdsOnly: true,
      }
    );

    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      this.interstitialLoaded = true;
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad error:', error);
      this.interstitialLoaded = false;
    });

    this.interstitialAd.load();
  }

  private initializeRewarded() {
    this.rewardedAd = RewardedAd.createForAdRequest(
      AD_CONFIG.rewardedAdId,
      {
        requestNonPersonalizedAdsOnly: true,
      }
    );

    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      this.rewardedLoaded = true;
    });

    this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Rewarded ad error:', error);
      this.rewardedLoaded = false;
    });

    this.rewardedAd.load();
  }

  private initializeAppOpen() {
    this.appOpenAd = AppOpenAd.createForAdRequest(
      AD_CONFIG.appOpenAdId,
      {
        requestNonPersonalizedAdsOnly: true,
      }
    );

    this.appOpenAd.addAdEventListener(AppOpenAdEventType.LOADED, () => {
      this.appOpenLoaded = true;
    });

    this.appOpenAd.addAdEventListener(AppOpenAdEventType.ERROR, (error) => {
      console.error('AppOpenAd error:', error);
      this.appOpenLoaded = false;
    });

    this.appOpenAd.load();
  }

  showInterstitial(): Promise<void> {
    return new Promise((resolve) => {
      this.gamesSinceLastAd++;
      
      if (this.gamesSinceLastAd >= 3 && this.interstitialLoaded) {
        this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
          this.gamesSinceLastAd = 0;
          this.initializeInterstitial(); // Load next ad
          resolve();
        });
        
        this.interstitialAd.show();
      } else {
        resolve();
      }
    });
  }

  showAppOpenAd(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.appOpenLoaded) {
        resolve();
        return;
      }

      let closedUnsubscribe: (() => void) | undefined;
      let errorUnsubscribe: (() => void) | undefined;

      const onAdClosed = () => {
        if (closedUnsubscribe) closedUnsubscribe();
        if (errorUnsubscribe) errorUnsubscribe();
        this.initializeAppOpen(); // recharge la pub
        resolve();
      };

      const onAdError = () => {
        if (closedUnsubscribe) closedUnsubscribe();
        if (errorUnsubscribe) errorUnsubscribe();
        resolve(); // même en cas d'erreur, on continue
      };

      closedUnsubscribe = this.appOpenAd.addAdEventListener(AppOpenAdEventType.CLOSED, onAdClosed);
      errorUnsubscribe = this.appOpenAd.addAdEventListener(AppOpenAdEventType.ERROR, onAdError);

      this.appOpenAd.show();
    });
  }

  showRewardedAd(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.rewardedLoaded) {
        resolve(false);
        return;
      }

      let rewarded = false;

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        rewarded = true;
      });

      this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        this.initializeRewarded(); // Load next ad
        resolve(rewarded);
      });

      this.rewardedAd.show();
    });
  }

  isRewardedAdLoaded(): boolean {
    return this.rewardedLoaded;
  }

  getBannerAd() {
    return BannerAd;
  }

  getBannerAdSize() {
    return BannerAdSize;
  }

  getBannerAdId() {
    return AD_CONFIG.bannerAdId;
  }
}

export default new AdService();