import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/stacks/MainStack';

import { useFonts, Roboto_700Bold,Roboto_500Medium ,Roboto_400Regular, Roboto_300Light } from "@expo-google-fonts/roboto"

export default function App() {
  const [fontLoaded] = useFonts({
    Roboto_700Bold,
    Roboto_500Medium,
    Roboto_400Regular,
    Roboto_300Light,
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
