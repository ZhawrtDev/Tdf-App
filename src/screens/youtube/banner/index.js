import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import styled from 'styled-components/native';
import { format, parseISO } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const API_KEY = 'AIzaSyDv3Jw2tgELQZacjV2YQr5vdFMKHvz3Czo';
const CHANNEL_ID = 'UCJ1RTO5MjmLlgI5rlEEqCiA';

const App = () => {
  const [videos, setVideos] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=4`)
      .then(response => {
        const videoItems = response.data.items.map((item, index) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          date: item.snippet.publishedAt,
          thumbnail: item.snippet.thumbnails.high.url,
          description: item.snippet.description,
          isNew: index === 0
        }));
        setVideos(videoItems);
      })
      .catch(error => {
        console.error('Erro ao carregar vídeos do YouTube:', error);
      });

    loadSavedVideos();
  }, []);

  const loadSavedVideos = async () => {
    try {
      const saved = await AsyncStorage.getItem('@saved_videos');
      if (saved !== null) {
        setSavedVideos(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos salvos:', error);
    }
  };

  const navigateToVideoDetail = (video) => {
    navigation.navigate('Video', { video });
  };

  const handleSaveToggle = async (video) => {
    const isVideoSaved = savedVideos.some(v => v.id === video.id);
    const updatedSavedVideos = isVideoSaved
      ? savedVideos.filter((v) => v.id !== video.id)
      : [...savedVideos, video];

    setSavedVideos(updatedSavedVideos);
    await AsyncStorage.setItem('@saved_videos', JSON.stringify(updatedSavedVideos));
  };

  return (
    <ScrollView horizontal>
      <Container>
        {videos.map(video => (
          <VideoContainer key={video.id}>
            <TouchableOpacity onPress={() => navigateToVideoDetail(video)}>
              <Thumbnail source={{ uri: video.thumbnail }} />
            </TouchableOpacity>
            {video.isNew && 
              <BoxNovo>
                <TextoNovo>Novo</TextoNovo>
              </BoxNovo>
            }
            <TextContainer>
              <Title numberOfLines={1}>{video.title}</Title>
              <Description numberOfLines={2}>{video.description}</Description>
              <Informação>
                <DivInformação>
                  <MaterialIcons name="date-range" size={20} color="#8E7A62" />
                  <Date>{format(parseISO(video.date), 'dd/MM/yyyy HH:mm')}</Date>
                </DivInformação>
                <TouchableOpacity onPress={() => handleSaveToggle(video)}>
                  <Ionicons
                    name={savedVideos.some(v => v.id === video.id) ? "heart" : "heart-outline"}
                    size={24}
                    color="#8E7A62"
                  />
                </TouchableOpacity>
              </Informação>
            </TextContainer>
          </VideoContainer>
        ))}
      </Container>
    </ScrollView>
  );
};

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  width: 95%;
  margin-left: 20px;
`;

const VideoContainer = styled.View`
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: #fffafa;
  margin-right: 10px;
  border-radius: 25px;
`;

const Thumbnail = styled.Image`
  width: 300px;
  height: 170px;
  margin-right: 10px;
  border-radius: 20px;
`;

const TextContainer = styled.View`
  flex: 1;
  margin-top: 20px;
  width: 300px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-family: "Montserrat_700Bold";
  color: #222022;
`;

const Informação = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-right: 10px;
`;

const DivInformação = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Date = styled.Text`
  margin-left: 10px;
  font-size: 14px;
  color: #8E7A62;
  font-family: "Montserrat_600SemiBold";
`;

const Description = styled.Text`
  font-size: 14px;
  color: #666;
  font-family: "Montserrat_600SemiBold";
  margin: 10px 0px;
`;

const BoxNovo = styled.View`
  position: absolute;
  top: 20px;
  right: 30px;
  justify-content: center;
  align-items: center;
  width: 70px;
  height: 30px;
  background: #8E7A62;
  border-radius: 10px;
`;

const TextoNovo = styled.Text`
  font-size: 16px;
  color: #fff;
  font-family: "Montserrat_500Medium";
`;

export default App;
