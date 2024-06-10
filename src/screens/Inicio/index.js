import React from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_500Medium } from "@expo-google-fonts/montserrat";

import Cabeçario from "../../components/cabeçario";
import Banner from "../youtube/banner";
import Sugestões from "../../components/suguestões";
import Navegação from '../../components/Navegação';

export default () => {
  const [fontLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });

  if (!fontLoaded) {
    return (
      <View style={styles.loader}>
        <Text>Carregando...</Text>
      </View>
    );
  }
  return (
    <>
      <ScrollView style={{ display: "flex", minHeight: 100, backgroundColor: "#FFFFFF" }}>
        {/* CABEÇARIO */}
        <Cabeçario />

        {/* BANNER */}
        <Banner />

        {/* SUGESTÕES */}
        <Sugestões />
      </ScrollView>
      <Navegação />
    </>
  );
}


const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});