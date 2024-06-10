import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";
import { ScrollView, TouchableOpacity, View, Text, Modal, FlatList, Image, PanResponder } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import FilterModal from "../../components/FilterModal";

export default () => {
  const navigation = useNavigation();

  const handlePressInicio = () => {
    navigation.navigate('Inicio')
  }

  const handlePressSearch = () => {
    navigation.navigate('Search')
  }
  return(
    <MainContainer style={{ backgroundColor: "#fff" }}>
      <ScrollView>
        <CabeçarioFav>
          <ContentIcon>
            <TouchableOpacity onPress={handlePressSearch}>
              <Feather style={{ marginRight: 10 }} name="search" size={24} color="#222022" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Feather name="git-commit" size={24} color="#222022" />
            </TouchableOpacity>
          </ContentIcon>
        </CabeçarioFav>
      </ScrollView>
    </MainContainer>
  );
};

const MainContainer = styled.View`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const CabeçarioFav = styled.View`
  margin: 40px 0px 20px 0px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 90%;
  margin-left: 20px;
`;

const ContentIcon = styled.View`
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;