import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, TouchableOpacity, View, Text, Modal, FlatList, Image, PanResponder } from 'react-native';
import styled, { css } from "styled-components/native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import axios from 'axios';

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

const SavedVideosScreen = () => {
  const [savedVideos, setSavedVideos] = useState([]);
  const [removePressed, setRemovePressed] = useState(false);
  const [selectedId, setSelectedId] = useState("box1");
  const [altText, setAltText] = useState("Todos");
  const [modalVisible, setModalVisible] = useState(false);
  const [videoToRemove, setVideoToRemove] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState("grid");
  const [isListView, setIsListView] = useState(false);
  const [showFavoritesButton, setShowFavoritesButton] = useState(true);
  const [modalVisibleGt, setModalVisibleGt] = useState(false);
  const [tempSelectedId, setTempSelectedId] = useState("box1");
  const [tempAltText, setTempAltText] = useState("Todos");
  const [channelThumbnailUrl, setChannelThumbnailUrl] = useState(null);
  const navigation = useNavigation();
  const scrollMainRef = useRef(null);
  const touchY = useRef(null);
  const [startY, setStartY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const modalHeight = 400;
  const minimumSlideDistance = 50

  const handlePressInicio = () => {
    navigation.navigate('Inicio')
  }

  const handlePressSearch = () => {
    navigation.navigate('Search')
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
    });

    return unsubscribe;
  }, [navigation]);

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

  useEffect(() => {
    loadSavedVideos();
    fetchChannelThumbnail();
  }, []);

  useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    loadSavedVideos();
  });

  return unsubscribe;
}, [navigation]);

  const fetchChannelThumbnail = async () => {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&id=${CHANNEL_ID}&part=snippet`);
      const channelDetails = response.data.items[0];
      const channelThumbnailUrl = channelDetails.snippet.thumbnails.default.url;
      setChannelThumbnailUrl(channelThumbnailUrl);
    } catch (error) {
      console.error('Error fetching channel thumbnail:', error);
    }
  };

  const handlePress = async (id, text) => {
    if (!modalVisibleGt) {
      setSelectedId(id);
      if (text === "Todos") {
        setAltText(`Todos`);
        loadSavedVideos();
      } else {
        setAltText(text);
        fetchVideos(text);
      }

      if (text !== "Todos") {
        setShowFavoritesButton(false);
      } else {
        setShowFavoritesButton(true);
      }
    }
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
      setShowFavoritesButton(true);
    } else {
      fetchVideos(tempAltText);
      setShowFavoritesButton(false);
    }
    setModalVisibleGt(false);
  };

  const loadSavedVideos = async () => {
    try {
      const saved = await AsyncStorage.getItem('@saved_videos');
      if (saved !== null) {
        setVideos(JSON.parse(saved));
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error('Error loading saved videos:', error);
    }
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

  const handleRemoveVideo = async () => {
    if (videoToRemove) { 
      const updatedVideos = videos.filter((v) => v.id !== videoToRemove.id);
      setVideos(updatedVideos);
      await AsyncStorage.setItem('@saved_videos', JSON.stringify(updatedVideos));
      setModalVisible(false);
      setVideoToRemove(null);
      loadSavedVideos();
    }
  };

  const handleSaveToggle = (video) => {
    setVideoToRemove(video); // Define o vídeo a ser removido, se necessário
    setModalVisible(true); // Abre o modal
  };
  

  const handleIconPress = (iconName) => {
    setSelectedIcon(iconName);
    setIsListView(iconName === "document-text");
  };

  const toggleModal = () => {
    setModalVisibleGt(!modalVisibleGt);
  };

  return (
    <MainContainer style={{ backgroundColor: "#fff" }}>
      <ScrollView>
        <CabeçarioFav>
          <ContentLogo>
            {channelThumbnailUrl && (
              <TouchableOpacity onPress={handlePressInicio}>
                <Image
                  source={{ uri: channelThumbnailUrl }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50
                  }}
                />
              </TouchableOpacity>
            )}
            <ContentLogoText>Favoritos</ContentLogoText>
          </ContentLogo>
          <ContentIcon>
            <TouchableOpacity onPress={handlePressSearch}>
              <Feather style={{ marginRight: 10 }} name="search" size={24} color="#222022" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleModal}>
              <Feather name="git-commit" size={24} color="#222022" />
            </TouchableOpacity>
          </ContentIcon>
        </CabeçarioFav>
        <ScrollView horizontal>
          <MainBox style={{ marginLeft: 5, marginTop: 10, marginBottom: 5 }}>
            <SelectableBox id="box1" selectedId={selectedId} onPress={handlePress} text="Todos" />
            <SelectableBox id="box2" selectedId={selectedId} onPress={handlePress} text="Sabedoria" />
            <SelectableBox id="box3" selectedId={selectedId} onPress={handlePress} text="Cristão" />
            <SelectableBox id="box4" selectedId={selectedId} onPress={handlePress} text="Carater" />
            <SelectableBox id="box5" selectedId={selectedId} onPress={handlePress} text="Vencedor" />
            <SelectableBox id="box6" selectedId={selectedId} onPress={handlePress} text="Deus" />
          </MainBox>
        </ScrollView>
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
        {videos.length === 0 ? (
          <NoVideosText>Nenhum vídeo Salvo ou Encontrado.</NoVideosText>
        ) : (
          videos.map((video) => (
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
                    {showFavoritesButton && (
                      <TouchableOpacity onPress={() => handleSaveToggle(video)}>
                        <Ionicons
                          name="heart"
                          size={24}
                          color="#8E7A62"
                        />
                      </TouchableOpacity>
                    )}
                  </Informação>
                </VideoInfo>
              </VideoCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
        <ModalContainerGt
          {...panResponder.panHandlers}
        >
          <ModalViewGt
            style={{
              transform: [{ translateY: Math.min(offsetY, modalHeight) }],
            }}
          >
          <ScrollModalMain
              {...panResponder.panHandlers} 
              ref={scrollMainRef}
            >
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
           style={{
            transform: [{ translateY: Math.min(offsetY, modalHeight) }],
          }}
          {...panResponder.panHandlers}
          >
            <ScrollModalMain
              {...panResponder.panHandlers} 
              ref={scrollMainRef}
            >
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

export default SavedVideosScreen;

const CabeçarioFav = styled.View`
  margin: 40px 0px 10px 0px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 90%;
  margin-left: 20px;
`;

const ContentLogo = styled.View`
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

const ContentLogoText = styled.Text`
  position: relative;
  top: 3px;
  font-family: "Poppins_700Bold";
  font-size: 20px;
  margin-left: 10px;
  color: #222022;
`;

const ContentIcon = styled.View`
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

const MainBox = styled.View`
  flex-direction: row;
  margin-left: 5px;
  justify-content: space-around;
`;

const Box = styled.View`
  border: 1.5px solid #8E7A62;
  margin-left: 10px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  padding: 0px 20px;
  margin-bottom: 10px;
  height: 40px;
  background: ${({ isSelected }) => (isSelected ? '#8E7A62' : 'transparent')};
`;

const TextBox = styled.Text`
  color: ${({ isSelected }) => (isSelected ? '#fff' : '#8E7A62')};
  font-size: 15px;
  font-family: "Montserrat_600SemiBold";
`;

const MainContainer = styled.View`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const NoVideosText = styled.Text`
  font-size: 17px;
  color: #666;
  font-family: "Montserrat_600SemiBold";
  text-align: center;
  margin-top: 20px;
`;

const ContentAlt = styled.View`
  margin-top: 5px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  margin-left: 20px;
  margin-bottom: 10px;
  width: 90%;
`;

const TextAlt = styled.Text`
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
  position: relative;
  margin-bottom: 10px;
  padding: 5px 10px;
  background: #fffafa;
  margin-right: 5px;
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
  left: ${({ isListView }) => isListView ? '-5px' : '-5px'};
  margin-top: ${({ isListView }) => isListView ? '20px' : '0'};
  width: ${({ isListView }) => isListView ? '300px' : '50%'};
  margin-left: ${({ isListView }) => isListView ? '0' : '5px'};
`;

const VideoInfoModal = styled.View`
  position: relative;
  left: ${({ isListView }) => isListView ? '-5px' : '0px'};
  margin-top: ${({ isListView }) => isListView ? '20px' : '0'};
  width: ${({ isListView }) => isListView ? '300px' : '150px'};
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
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
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