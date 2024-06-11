import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, TouchableOpacity, View, Text, Modal, FlatList, Image, PanResponder, TextInput } from 'react-native';
import styled, { css } from "styled-components/native";
import { Ionicons, MaterialIcons, AntDesign, Feather } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';

const API_KEY = 'AIzaSyCSXN2R0kqbPkW__nqgRq2SJKFIezFXAz4';
const CHANNEL_ID = 'UCJ1RTO5MjmLlgI5rlEEqCiA';

const SelectableBox = ({ id, selectedId, onPress, text }) => {
  const isSelected = id === selectedId;

  return (
    <TouchableOpacity onPress={() => onPress(id, text)}>
      <Box isSelected={isSelected}>
        <TextBox isSelected={isSelected}>{text}</TextBox>
      </Box>
    </TouchableOpacity>
  );
};

const MyComponent = () => {
  const navigation = useNavigation();
  const inputWidth = useSharedValue(0);
  const searchIconOpacity = useSharedValue(0);
  const filterIconOpacity = useSharedValue(0);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedId, setSelectedId] = useState("box1");
  const [altText, setAltText] = useState("Todos");
  const [selectedIcon, setSelectedIcon] = useState("grid");
  const [videos, setVideos] = useState([]);
  const [isListView, setIsListView] = useState(false);
  const [savedVideos, setSavedVideos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoToRemove, setVideoToRemove] = useState(null);
  const [modalVisibleGt, setModalVisibleGt] = useState(false);
  const [tempSelectedId, setTempSelectedId] = useState("box1");
  const [tempAltText, setTempAltText] = useState("Todos");
  const scrollMainRef = useRef(null);
  const [startY, setStartY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const modalHeight = 400;
  const minimumSlideDistance = 50;

  useEffect(() => {
    const loadSavedVideos = async () => {
      try {
        const savedVideosString = await AsyncStorage.getItem('@saved_videos');
        if (savedVideosString !== null) {
          setSavedVideos(JSON.parse(savedVideosString));
        }
      } catch (error) {
        console.error('Error loading saved videos:', error);
      }
    };

    loadSavedVideos();
  }, []);

  useEffect(() => {
    inputWidth.value = withTiming(300, { duration: 1000, easing: Easing.inOut(Easing.ease) });
    searchIconOpacity.value = withDelay(1000, withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }));
    filterIconOpacity.value = withDelay(1500, withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }));
  }, []);

  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      width: inputWidth.value,
    };
  });

  const animatedSearchIconStyle = useAnimatedStyle(() => {
    return {
      opacity: searchIconOpacity.value,
    };
  });

  const animatedFilterIconStyle = useAnimatedStyle(() => {
    return {
      opacity: filterIconOpacity.value,
    };
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gestureState) => {
      setStartY(gestureState.y0);
    },
    onPanResponderMove: (_, gestureState) => {
      const deltaY = gestureState.moveY - startY;
      if (deltaY > 0) {
        setOffsetY(deltaY);
      }
    },
    onPanResponderRelease: () => {
      if (offsetY > minimumSlideDistance) {
        setModalVisible(false);
        setModalVisibleGt(false);
        setOffsetY(0);
      } else {
        setOffsetY(0);
      }
      setStartY(0);
    },
    onPanResponderTerminate: () => {
      setOffsetY(0);
      setStartY(0);
    },
  });

  const handlePress = async (id, text) => {
    setSelectedId(id);
    setAltText(text);
    setVideos([]);

    if (text !== "Todos") {
      fetchVideos(text);
    }
  };

  const handleIconPress = (iconName) => {
    setSelectedIcon(iconName);
    setIsListView(iconName === "document-text");
  };

  const fetchVideos = async (query = '') => {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=20&q=${query}`);
      const videoItems = response.data.items.map((item, index) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        date: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high.url,
        description: item.snippet.description,
        isNew: index === 0
      }));
      setVideos(videoItems);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleVideoPress = (video) => {
    navigation.navigate('Video', { video });
  };

  const isVideoSaved = (videoId) => savedVideos.some(v => v.id === videoId);

  const handleSaveToggle = (video) => {
    if (isVideoSaved(video.id)) {
      setVideoToRemove(video);
      setModalVisible(true);
    } else {
      const updatedSavedVideos = [...savedVideos, video];
      setSavedVideos(updatedSavedVideos);
      AsyncStorage.setItem('@saved_videos', JSON.stringify(updatedSavedVideos));
    }
  };

  const handleRemoveVideo = async () => {
    if (videoToRemove) { 
      const updatedVideos = savedVideos.filter((v) => v.id !== videoToRemove.id);
      setSavedVideos(updatedVideos);
      await AsyncStorage.setItem('@saved_videos', JSON.stringify(updatedVideos));
      setModalVisible(false);
      setVideoToRemove(null);
    }
  };

  const toggleModal = () => {
    setModalVisibleGt(!modalVisibleGt);
  };

  const handlePressModal = async (id, text) => {
    setTempSelectedId(id);
    setTempAltText(text);
  };

  const applySelection = async () => {
    setSelectedId(tempSelectedId);
    setAltText(tempAltText);
    if (tempAltText === "Todos") {
      loadSavedVideos();
    } else {
      fetchVideos(tempAltText);
    }
    setModalVisibleGt(false);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    fetchVideos(query);
  };

  return (
    <MainContainer style={{ backgroundColor: "#fff" }}>
      <ScrollView>
        <CabeçarioFav>
          <TouchableOpacity onPress={handleGoBack}>
            <AntDesign name="arrowleft" size={24} color="#4A4549" />
          </TouchableOpacity>
          <ContentIcon>
            <SearchIcon style={animatedSearchIconStyle}>
              <Feather name="search" size={21} color={isFocused ? "#8E7A62" : "#CDC7CC"} />
            </SearchIcon>
            <AnimatedSearchInput
              style={animatedInputStyle}
              placeholder="Prudência"
              placeholderTextColor="#4A4549"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              isFocused={isFocused}
              onChangeText={handleSearchChange}
            />
            <TouchableOpacity style={{ marginBottom: 25 }} onPress={() => setModalVisibleGt(true)}>
              <FilterIcon style={animatedFilterIconStyle}>
                <Feather name="git-commit" size={25} color="#8E7A62" style={{ marginRight: 10 }} />
              </FilterIcon>
            </TouchableOpacity>
          </ContentIcon>
        </CabeçarioFav>
        <ScrollView horizontal>
          <MainBox>
            <SelectableBox id="box1" selectedId={selectedId} onPress={handlePress} text="Todos" />
            <SelectableBox id="box2" selectedId={selectedId} onPress={handlePress} text="Sabedoria" />
            <SelectableBox id="box3" selectedId={selectedId} onPress={handlePress} text="Cristão" />
            <SelectableBox id="box4" selectedId={selectedId} onPress={handlePress} text="Carater" />
            <SelectableBox id="box5" selectedId={selectedId} onPress={handlePress} text="Vencedor" />
            <SelectableBox id="box6" selectedId={selectedId} onPress={handlePress} text="Deus" />
          </MainBox>
        </ScrollView>
        {videos.length > 0 && selectedId !== "box1" && (
          <ContentAlt>
            <TextAlt>{altText}</TextAlt>
            <BoxAlt>
              <MargAlt>
                <TouchableOpacity onPress={() => handleIconPress("document-text")}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={selectedIcon === "document-text" ? "#8E7A62" : "#B0AFB1"}
                  />
                </TouchableOpacity>
              </MargAlt>
              <TouchableOpacity onPress={() => handleIconPress("grid")}>
                <Ionicons
                  name="grid"
                  size={20}
                  color={selectedIcon === "grid" ? "#8E7A62" : "#B0AFB1"}
                />
              </TouchableOpacity>
            </BoxAlt>
          </ContentAlt>
        )}

        {videos.length > 0 && selectedId === "box1" && (
          <ContentAlt>
            <TextAlt>{videos.length} {videos.length === 1 ? "Encontrado" : "Encontrados"}</TextAlt>
            <BoxAlt>
              <MargAlt>
                <TouchableOpacity onPress={() => handleIconPress("document-text")}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={selectedIcon === "document-text" ? "#8E7A62" : "#B0AFB1"}
                  />
                </TouchableOpacity>
              </MargAlt>
              <TouchableOpacity onPress={() => handleIconPress("grid")}>
                <Ionicons
                  name="grid"
                  size={20}
                  color={selectedIcon === "grid" ? "#8E7A62" : "#B0AFB1"}
                />
              </TouchableOpacity>
            </BoxAlt>
          </ContentAlt>
        )}
        <ScrollView>
          {videos.length === 0 && searchQuery && (
            <NoVideoContent>
              <NotFoundImage
                source={require('../../imgs/Nfoud.png')}
              />
              <NoVideosText>Desculpe, a palavra-chave que você digitou não pode ser encontrada. Verifique novamente ou pesquise com outra palavra-chave.</NoVideosText>
            </NoVideoContent>
          )}
          {videos.map(video => (
            <TouchableOpacity key={video.id} onPress={() => handleVideoPress(video)}>
              <VideoCard isListView={isListView}>
                <VideoThumbnail isListView={isListView} source={{ uri: video.thumbnail }} />
                <VideoInfo isListView={isListView}>
                  <VideoTitle isListView={isListView} numberOfLines={1}>{video.title}</VideoTitle>
                  <VideoDescription isListView={isListView} numberOfLines={2}>{video.description}</VideoDescription>
                  <Informação>
                    <DivInformação>
                      <MaterialIcons name="date-range" size={15} color="#8E7A62" />
                      <VideoDate>{new Date(video.date).toLocaleDateString('pt-BR')}</VideoDate>
                    </DivInformação>
                    <TouchableOpacity onPress={() => handleSaveToggle(video)}>
                      <Ionicons
                        name={isVideoSaved(video.id) ? "heart" : "heart-outline"}
                        size={24}
                        color="#8E7A62"
                      />
                    </TouchableOpacity>
                  </Informação>
                </VideoInfo>
              </VideoCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Modal de Filtro */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisibleGt}
        onRequestClose={() => {
          if (offsetY === 0 || offsetY > minimumSlideDistance) {
            setModalVisibleGt(false);
            setOffsetY(0);
          }
        }}
      >
        <ModalContainerGt {...panResponder.panHandlers}>
          <ModalViewGt style={{ transform: [{ translateY: Math.min(offsetY, modalHeight) }] }}>
            <ScrollModalMain {...panResponder.panHandlers} ref={scrollMainRef}>
              <ScrolModal></ScrolModal>
            </ScrollModalMain>
            <ModalTextGt>Filtro</ModalTextGt>
            <BorderGt />
            <InformGt>
              <TextGt>Categoria Reflexão</TextGt>
              <TouchableOpacity>
                <OutherText>Ver Mais</OutherText>
              </TouchableOpacity>
            </InformGt>
            <FatListContent
              data={[
                { id: 'box1', text: 'Todos' },
                { id: 'box2', text: 'Sabedoria' },
                { id: 'box3', text: 'Cristão' },
                { id: 'box4', text: 'Carater' },
                { id: 'box5', text: 'Vencedor' },
                { id: 'box6', text: 'Deus' },
              ]}
              renderItem={({ item }) => (
                <SelectableBox
                  id={item.id}
                  selectedId={tempSelectedId}
                  onPress={handlePressModal}
                  text={item.text}
                />
              )}
              keyExtractor={(item) => item.id}
              numColumns={3}
            />
            <ButtonContainerGt>
              <ButtãoOpc style={{ backgroundColor: "#8e7a622e" }} onPress={toggleModal}>
                <TextButtãoOpc style={{ color: "#8E7A62" }}>Cancelar</TextButtãoOpc>
              </ButtãoOpc>
              <ButtãoOpc onPress={applySelection}>
                <TextButtãoOpc>Aplicar</TextButtãoOpc>
              </ButtãoOpc>
            </ButtonContainerGt>
          </ModalViewGt>
        </ModalContainerGt>
      </Modal>

      {/* Modal de Remoção */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          if (offsetY === 0) {
            setModalVisible(false);
            setVideoToRemove(null);
            setModalVisible(false);
          }
        }}
      >
        <ModalContainer {...panResponder.panHandlers}>
          <ModalView 
           style={{ transform: [{ translateY: Math.min(offsetY, modalHeight) }] }}
           {...panResponder.panHandlers}
          >
            <ScrollModalMain {...panResponder.panHandlers} ref={scrollMainRef}>
              <ScrolModal></ScrolModal>
            </ScrollModalMain>
            <ModalText>Remover dos Favoritos?</ModalText>
            {videoToRemove && (
              <VideoModal>
                <VideoThumbnail source={{ uri: videoToRemove.thumbnail }} />
                <VideoInfoModal>
                  <VideoTitle numberOfLines={1}>{videoToRemove.title}</VideoTitle>
                  <VideoDescription numberOfLines={2}>{videoToRemove.description}</VideoDescription>
                  <Informação>
                    <DivInformação>
                      <MaterialIcons name="date-range" size={15} color="#8E7A62" />
                      <VideoDate>{new Date(videoToRemove.date).toLocaleDateString('pt-BR')}</VideoDate>
                    </DivInformação>
                  </Informação>
                </VideoInfoModal>
              </VideoModal>
            )}
            <ButtonContainer>
              <ButtãoOpc style={{ backgroundColor: "#8e7a622e" }} onPress={() => setModalVisible(false)}>
                <TextButtãoOpc style={{ color: "#8E7A62" }}>Cancelar</TextButtãoOpc>
              </ButtãoOpc>
              <ButtãoOpc onPress={handleRemoveVideo}>
                <TextButtãoOpc>Remover</TextButtãoOpc>
              </ButtãoOpc>
            </ButtonContainer>
          </ModalView>
        </ModalContainer>
      </Modal>
    </MainContainer>
  );
};

export default MyComponent;

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
  position: relative;
  margin-left: 20px;
`;

const AnimatedSearchInput = styled(Animated.createAnimatedComponent(TextInput))`
  background: ${({ isFocused }) => (isFocused ? '#8e7a621c' : '#F2F2F2')};
  border: ${({ isFocused }) => (isFocused ? '1px solid #8E7A62' : 'none')};
  padding: 8px;
  height: 50px;
  padding-left: 55px;
  padding-right: 50px;
  border-radius: 18px;
  margin-right: 10px;
  overflow: hidden;
  font-family: 'Montserrat_600SemiBold';
  font-size: 13px;
  color: #4A4549;
`;

const SearchIcon = styled(Animated.View)`
  position: absolute;
  left: 20px;
  z-index: 1;
`;

const FilterIcon = styled(Animated.View)`
  position: absolute;
  right: 20px;
`;

const MainBox = styled.View`
  flex-direction: row;
  margin-left: 5px;
  justify-content: space-around;
`;

const Box = styled.View`
  border: 1.5px solid #8E7A62;
  margin-left: 10px;
  margin-bottom: 10px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  padding: 0px 20px;
  height: 40px;
  background: ${({ isSelected }) => (isSelected ? '#8E7A62' : 'transparent')};
`;

const TextBox = styled.Text`
  color: ${({ isSelected }) => (isSelected ? '#fff' : '#8E7A62')};
  font-size: 15px;
  font-family: "Montserrat_600SemiBold";
`;

const ContentAlt = styled.View`
  margin-bottom: 20px;
  margin-top: 15px;
  margin-left: 20px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 90%;
`;

const TextAlt = styled.Text`
  position: relative;
  top: 3px;
  font-size: 20px;
  font-family: "Poppins_700Bold";
  text-align: center;
  color: #232123;
`;

const BoxAlt = styled.View`
  flex-direction: row;
`;

const MargAlt = styled.View`
  margin-right: 10px;
`;

const VideoCard = styled.View`
  margin-left: ${({ isListView }) => isListView ? '0px' : '-10px'};
  position: relative;
  margin-left: 10px;
  margin-bottom: 10px;
  padding: 5px 10px 5px 0px;
  background: #fffafa;
  border-radius: 25px;
  width: 96%;
  ${({ isListView }) => isListView ? css`
    flex-direction: column;
    justify-content: center;
    align-items: center;
  ` : css`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `}
`;

const VideoThumbnail = styled.Image`
  width: ${({ isListView }) => isListView ? '300px' : '180px'};
  height: ${({ isListView }) => isListView ? '170px' : '100px'};
  margin-right: 10px;
  border-radius: 20px;
`;

const VideoInfo = styled.View`
  position: relative;
  left: ${({ isListView }) => isListView ? '-5px' : '0'};
  margin-top: ${({ isListView }) => isListView ? '20px' : '0'};
  width: ${({ isListView }) => isListView ? '300px' : '50%'};
  margin-left: ${({ isListView }) => isListView ? '0' : '5px'};
`;

const VideoTitle = styled.Text`
  font-size: ${({ isListView }) => isListView ? '20px' : '16px'};
  font-family: "Montserrat_700Bold";
  color: #222022;
`;

const VideoDescription = styled.Text`
  font-size: ${({ isListView }) => isListView ? '14px' : '12px'};
  color: #666;
  font-family: "Montserrat_600SemiBold";
  margin: 10px 0px;
`;

const VideoDate = styled.Text`
  margin-left: ${({ isListView }) => isListView ? '10px' : '5px'};
  font-size: 14px;
  color: #8E7A62;
  font-family: "Montserrat_600SemiBold";
`;

const DivInformação = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Informação = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-right: 10px;
`;

const NoVideoContent = styled.View`
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  width: 95%;
  margin-left: 10px;
`;

const NoVideosText = styled.Text`
  font-size: 20px;
  text-align: center;
  margin-top: 20px;
  font-family: "Montserrat_500Medium";
  color: #676466;
  font-size: 17px;
  width: 95%;
  margin-left: 10px;
`;

const NotFoundImage = styled(Image)`
  width: 95%;
  height: 300px;
  margin-bottom: 10px;
`;

const ModalContainer = styled.View`
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalView = styled(View)`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 300px;
  background-color: #fff;
  border-radius: 35px 35px 0px 0px;
  align-items: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  elevation: 5;
`;

const ScrollModalMain = styled.View`
  position: absolute;
  align-items: center;
  width: 100%;
  height: 50px;
`;

const ScrolModal = styled.View`
  margin-top: 10px;
  margin-bottom: -15px;
  background: #66666685;
  border-radius: 10px;
  width: 20%;
  height: 2px;
`;

const ModalText = styled.Text`
  font-size: 20px;
  color: #222022;
  font-family: "Montserrat_700Bold";
  text-align: center;
  margin: 30px 0px 20px 0px;
`;

const ButtãoOpc = styled(TouchableOpacity)`
  width: 48%;
  height: 50px;
  margin: 0px 5px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  background: #8E7A62;
`;

const TextButtãoOpc = styled.Text`
  color: #fff;
  font-family: "Montserrat_600SemiBold";
`;

const ButtonContainer = styled.View`
  position: relative;
  margin-top: 20px;
  flex-direction: row;
  justify-content: space-between;
  width: 95%;
`;

const VideoModal = styled.View`
  margin-top: 10px;
  margin-left: 20px;
  margin-right: 20px;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const VideoInfoModal = styled.View`
  flex: 1;
  margin-left: 10px;
`;

const ModalContainerGt = styled.View`
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalViewGt = styled.View`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 350px;
  background-color: #fff;
  border-radius: 35px 35px 0px 0px;
  align-items: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  elevation: 5;
`;

const ButtonContainerGt = styled.View`
  position: relative;
  bottom: 20px;
  margin-top: 20px;
  flex-direction: row;
  justify-content: space-between;
  width: 95%;
`;

const ModalTextGt = styled.Text`
  font-size: 20px;
  color: #222022;
  font-family: "Montserrat_700Bold";
  text-align: center;
  margin: 30px 0px 20px 0px;
`;

const BorderGt = styled.View`
  width: 100%;
  height: 1px;
  background: #6666663d;
  margin-bottom: 20px;
`;

const InformGt = styled.View`
  width: 90%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-direction: row;
`;

const TextGt = styled.Text`
  font-size: 17px;
  color: #222022;
  font-family: "Poppins_700Bold";
`;

const OutherText = styled.Text`
  font-size: 17px;
  font-family: "Montserrat_600SemiBold";
  color: #8E7A62;
`;

const FatListContent = styled(FlatList)`
`;
