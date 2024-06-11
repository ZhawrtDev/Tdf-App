import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/stacks/MainStack';

import { useFonts, Poppins_700Bold, Poppins_600SemiBold, Poppins_500Medium } from "@expo-google-fonts/poppins"

export default function App() {
  const [fontLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
    Poppins_500Medium,
});

  if (!fontLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
}
