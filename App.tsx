// import React from 'react';
// import { StatusBar } from 'react-native';
// import AppNavigator from './src/navigation/AppNavigator';
// import { COLORS } from './src/constants';
// import { AppInitializer } from '@/components/AppInitializer';

// const App: React.FC = () => {
//   return (
//     <AppInitializer>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor={COLORS.BACKGROUND}
//         translucent={false}
//       />
//       <AppNavigator />
//     </AppInitializer>
//   );
// };

// export default App;

import React from 'react';
import { StatusBar } from 'react-native';
import { GameProvider } from './src/context/GameContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants';

const App: React.FC = () => {
  return (
    <GameProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.BACKGROUND}
        translucent={false}
      />
      <AppNavigator />
    </GameProvider>
  );
};

export default App;