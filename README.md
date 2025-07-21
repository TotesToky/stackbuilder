This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# Stack Builder - React Native Game

A complete, production-ready mobile game built with React Native CLI and TypeScript.

## Features

- **Complete Game Mechanics**: Block stacking with physics, progressive difficulty, and scoring
- **Professional UI**: Animated screens with smooth transitions and particle effects
- **Audio Integration**: Background music and sound effects with user controls
- **Monetization**: Google Mobile Ads integration with rewarded, interstitial, and banner ads
- **Data Persistence**: High scores and settings saved locally
- **Skin System**: Unlockable skins with preview animations
- **Cross-Platform**: Ready for both Android and iOS deployment

## Project Structure

```
StackBuilder/
├── src/
│   ├── components/         # Reusable components
│   │   └── GameEngine.tsx  # Main game logic and rendering
│   ├── context/            # React Context for state management
│   │   └── GameContext.tsx # Game state and user settings
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/            # All game screens
│   │   ├── SplashScreen.tsx
│   │   ├── MainMenuScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── GameOverScreen.tsx
│   │   ├── SkinShopScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # External services
│   │   ├── SoundService.ts # Audio management
│   │   └── AdService.ts    # Advertisement integration
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── constants/          # App constants and configuration
│       └── index.ts
├── android/                # Android-specific files
├── ios/                    # iOS-specific files
└── App.tsx                 # Root component
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone [repository-url]
   cd StackBuilder
   npm install
   ```

2. **iOS Setup (macOS only)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Android Setup**
   - Open Android Studio
   - Open the `android` folder
   - Sync project with Gradle files

### Running the App

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

**Development Server:**
```bash
npm start
```

## Key Technologies

- **React Native CLI**: Framework for cross-platform mobile development
- **TypeScript**: Static typing for better development experience
- **React Navigation**: Screen navigation and routing
- **React Native Reanimated**: High-performance animations
- **React Native Sound**: Audio playback and background music
- **Google Mobile Ads**: Monetization through advertisements
- **SQLite Storage**: Robust local database for game data, statistics, and user preferences

## Game Mechanics

### Core Gameplay
- **Objective**: Stack blocks to build the tallest tower possible
- **Controls**: Tap anywhere to drop the current block
- **Scoring**: Points awarded for successful drops, bonus for perfect alignment
- **Progressive Difficulty**: Blocks move faster and get smaller as you progress

### Special Features
- **Perfect Drops**: Exact alignment gives bonus points and particle effects
- **Combo System**: Consecutive perfect drops increase score multiplier
- **Skin System**: Unlock new visual themes with earned points
- **Ad Integration**: Continue playing by watching rewarded ads

## Monetization

The game includes three types of advertisements:
- **Banner Ads**: Displayed on menu and game over screens
- **Interstitial Ads**: Full-screen ads shown every 3 games
- **Rewarded Ads**: Optional ads that allow players to continue after game over

## Building for Production

### Android Release Build

1. **Generate Release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. **Find APK at:**
   `android/app/build/outputs/apk/release/app-release.apk`

### iOS Release Build

1. **Archive in Xcode:**
   - Open `ios/StackBuilder.xcworkspace` in Xcode
   - Select "Generic iOS Device"
   - Product → Archive

2. **Distribute to App Store:**
   - Use the Organizer window to upload to App Store Connect

## Configuration

### Database Setup

The game uses SQLite for data storage with the following tables:
- `user_settings`: User preferences and settings
- `game_stats`: Game statistics and high scores
- `skins`: Available skins and unlock status
- `game_sessions`: Individual game session records for analytics

The database is automatically initialized on first app launch.

### Google Ads Setup

1. **Create Google AdMob Account**
2. **Replace Test Ad IDs in `src/constants/index.ts`:**
   ```typescript
   export const AD_CONFIG = {
     rewardedAdId: 'your-rewarded-ad-id',
     interstitialAdId: 'your-interstitial-ad-id',
     bannerAdId: 'your-banner-ad-id',
   };
   ```

3. **Update Android Manifest:**
   Replace the APPLICATION_ID in `android/app/src/main/AndroidManifest.xml`

4. **Update iOS Info.plist:**
   Replace GADApplicationIdentifier in `ios/StackBuilder/Info.plist`

### Audio Assets

Add your audio files to `src/assets/sounds/`:
- `drop.mp3` - Block drop sound
- `perfect.mp3` - Perfect alignment sound
- `game_over.mp3` - Game over sound
- `background_music.mp3` - Background music loop

## Testing

- **Android**: Test on physical device or emulator
- **iOS**: Test on physical device or simulator
- **Performance**: Ensure 60fps gameplay on target devices
- **Audio**: Test sound effects and music playback
- **Ads**: Verify ad loading and display functionality

## Deployment

### Android (Google Play Store)

1. **Generate Signed APK/AAB**
2. **Create Google Play Console Account**
3. **Upload APK/AAB**
4. **Complete Store Listing**
5. **Submit for Review**

### iOS (App Store)

1. **Archive and Upload via Xcode**
2. **Create App Store Connect Account**
3. **Configure App Information**
4. **Submit for Review**

## Support

This is a complete, production-ready game template. Customize the game mechanics, visual design, and monetization strategy according to your needs.

## License

This project is provided as-is for educational and commercial use.
