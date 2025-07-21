import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import SplashScreen from '@/screens/SplashScreen';
import MainMenuScreen from '@/screens/MainMenuScreen';
import GameScreen from '@/screens/GameScreen';
import GameOverScreen from '@/screens/GameOverScreen';
import SkinShopScreen from '@/screens/SkinShopScreen';
import SettingsScreen from '@/screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="MainMenu" component={MainMenuScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Game" component={GameScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="GameOver" component={GameOverScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SkinShop" component={SkinShopScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;