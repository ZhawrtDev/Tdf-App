import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Inicio from '../../screens/Inicio';
import Search from '../../screens/Search'
import VideoScreen from "../../screens/youtube/VideoScreen";
import SavedVideos from "../../screens/SavedVideos";

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Inicio" component={Inicio} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Video" component={VideoScreen} />
      <Stack.Screen name="SavedVideos" component={SavedVideos} />
    </Stack.Navigator>
  );
}
