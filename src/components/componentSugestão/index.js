import React, { useState, useEffect } from 'react';
import styled, { css } from "styled-components/native";
import { TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'AIzaSyDv3Jw2tgELQZacjV2YQr5vdFMKHvz3Czo';
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
  const [selectedId, setSelectedId] = useState("box1");
  const [altText, setAltText] = useState("Todos");
  const [selectedIcon, setSelectedIcon] = useState("grid");
  const [videos, setVideos] = useState([]);
  const [isListView, setIsListView] = useState(false);
  const [savedVideos, setSavedVideos] = useState([]);
  const navigation = useNavigation();

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
    fetchVideos();
  }, []);

  const handlePress = async (id, text) => {
    setSelectedId(id);
    setAltText(text);

    if (text === "Todos") {
      fetchVideos();
    } else {
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
    const updatedSavedVideos = isVideoSaved(video.id) ? 
      savedVideos.filter((v) => v.id !== video.id) : 
      [...savedVideos, video];

    setSavedVideos(updatedSavedVideos);
    AsyncStorage.setItem('@saved_videos', JSON.stringify(updatedSavedVideos));
  };

  return (
    <MainContainer>
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
      <ScrollView>
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
    </MainContainer>
  );
}

export default MyComponent;

const MainContainer = styled.View`
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const MainBox = styled.View`
  flex-direction: row;
  margin-left: -10px;
  justify-content: space-around;
`;

const Box = styled.View`
  border: 1.5px solid #8E7A62;
  margin-left: 10px;
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
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
`;

const TextAlt = styled.Text`
  font-size: 20px;
  font-family: "Roboto_700Bold";
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
  margin-bottom: 10px;
  padding: 10px;
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
