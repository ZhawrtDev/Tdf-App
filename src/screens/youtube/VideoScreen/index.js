import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TouchableOpacity, ScrollView, StyleSheet, View, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import YoutubePlayer from "react-native-youtube-iframe";
import { BlurView } from 'expo-blur';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'AIzaSyB7QxIRi6mCulM3V4qBQr3yL3dlVnPGG_I';
const CHANNEL_ID = 'UCJ1RTO5MjmLlgI5rlEEqCiA';

const VideoScreen = ({ route }) => {
  const { video } = route.params;
  const navigation = useNavigation();
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [duration, setDuration] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);

  useEffect(() => {
    fetchRelatedVideos(video.title);
    loadSavedVideos();
  }, [video.title]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
      alert("Vídeo terminou!");
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setShowPlayer(true);
    setPlaying(true);
  }, []);

  const onReady = useCallback(() => {
    playerRef.current
      .getDuration()
      .then(duration => setDuration(duration))
      .catch(error => console.error('Error getting duration:', error));
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const fetchRelatedVideos = async (query) => {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=20&q=${query}`);
      const relatedVideos = response.data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        date: item.snippet.publishedAt,
        description: item.snippet.description
      }));
      setRelatedVideos(relatedVideos);
    } catch (error) {
      console.error('Error fetching related videos:', error);
    }
  };

  const loadSavedVideos = async () => {
    try {
      const saved = await AsyncStorage.getItem('@saved_videos');
      if (saved !== null) {
        setSavedVideos(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved videos:', error);
    }
  };

  const saveVideo = async (video) => {
    try {
      const newSavedVideos = [...savedVideos, video];
      setSavedVideos(newSavedVideos);
      await AsyncStorage.setItem('@saved_videos', JSON.stringify(newSavedVideos));
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const removeVideo = async (videoId) => {
    try {
      const updatedSavedVideos = savedVideos.filter((v) => v.id !== videoId);
      setSavedVideos(updatedSavedVideos);
      await AsyncStorage.setItem('@saved_videos', JSON.stringify(updatedSavedVideos));
    } catch (error) {
      console.error('Error removing video:', error);
    }
  };

  const handleSaveToggle = (video) => {
    if (isVideoSaved(video.id)) {
      removeVideo(video.id);
    } else {
      saveVideo(video);
    }
  };

  const isVideoSaved = (videoId) => savedVideos.some(v => v.id === videoId);

  return (
    <BlurBackground>
      <ScrollView style={{ flex: 1 }}>
        <ThumbnailContainer>
          {showPlayer ? (
            <YoutubePlayer
              ref={playerRef}
              height={225}
              play={playing}
              videoId={video.id}
              onChangeState={onStateChange}
              onReady={onReady}
            />
          ) : (
            <ThumbnailImage source={{ uri: video.thumbnail }} />
          )}
        </ThumbnailContainer>
        <Navbar>
          <TouchableNav onPress={handleGoBack}>
            <AntDesign name="arrowleft" size={24} color="#222022" />
            <TextNav>Voltar</TextNav>
          </TouchableNav>
          <TouchableNav
            style={{ marginRight: 10 }}
            onPress={() => handleSaveToggle(video)}
          >
            <Ionicons
              name={isVideoSaved(video.id) ? "heart" : "heart-outline"}
              size={24}
              color="#222022"
            />
            <TextNav>Salvar</TextNav>
          </TouchableNav>
          <TouchableNav onPress={togglePlaying}>
            <Ionicons name={playing ? "pause" : "play-outline"} size={24} color="#222022" />
            <TextNav>{playing ? "Pause" : "Play"}</TextNav>
          </TouchableNav>
        </Navbar>
        <ContentInform>
          <DivNav>
            <Titulo numberOfLines={1}>{video.title.substring(18)}</Titulo>
            {duration !== null && <DurationText>{formatDuration(duration)}</DurationText>}
          </DivNav>
          <Descrição numberOfLines={3}>{video.description}</Descrição>
        </ContentInform>
        <Border />
        <RelatedVideosContainer horizontal showsHorizontalScrollIndicator={false}>
          {relatedVideos.map((relatedVideo) => (
            <TouchableOpacity key={relatedVideo.id} onPress={() => navigation.navigate('Video', { video: relatedVideo })}>
              <RelatedVideoCard>
                <RelatedThumbnail source={{ uri: relatedVideo.thumbnail }} />
                <RelatedTextDiv>
                  <RelatedTitle numberOfLines={1}>{relatedVideo.title}</RelatedTitle>
                  <RelatedDescrição numberOfLines={2}>{relatedVideo.description}</RelatedDescrição>
                  <Informação>
                    <DivInformação>
                      <MaterialIcons name="date-range" size={15} color="#8E7A62" />
                      <VideoDate>{new Date(video.date).toLocaleDateString('pt-BR')}</VideoDate>
                    </DivInformação>
                    <TouchableOpacity onPress={() => handleSaveToggle(relatedVideo)}>
                      <Ionicons
                        name={isVideoSaved(relatedVideo.id) ? "heart" : "heart-outline"}
                        size={24}
                        color="#8E7A62"
                      />
                    </TouchableOpacity>
                  </Informação>
                </RelatedTextDiv>
              </RelatedVideoCard>
            </TouchableOpacity>
          ))}
        </RelatedVideosContainer>
      </ScrollView>
      <NavegaçãoDest>
        <TouchableOpacity>
          <ButtonDest>
            <TextDest>Enviar Destaque</TextDest>
          </ButtonDest>
        </TouchableOpacity>
      </NavegaçãoDest>
    </BlurBackground>
  );
};

const BlurBackground = ({ children }) => (
  <BlurView style={styles.absolute} intensity={50} tint="light">
    {children}
  </BlurView>
);

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  }
});

export default VideoScreen;

const ThumbnailContainer = styled.View`
  width: 100%;
  height: 225px;
  border-radius: 0px 0px 20px 20px;
  overflow: hidden;
`;

const ThumbnailImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const Navbar = styled.View`
  position: absolute;
  top: 190px;
  justify-content: space-between;
  padding: 0px 30px;
  align-items: center;
  flex-direction: row;
  width: 65%;
  height: 65px;
  margin-left: 60px;
  border-radius: 30px;
  background: #fff;

  /* Android shadow */
  elevation: 5;

  /* iOS shadow */
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
`;

const TouchableNav = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const TextNav = styled.Text`
  font-family: "Montserrat_500Medium";
  font-size: 12px;
  color: #222022;
`;

const ContentInform = styled.View`
  flex-direction: column;
  width: 100%;
  margin-left: 20px;
  margin-top: 40px;
`;

const DivNav = styled.View`
  align-items: center;
  flex-direction: row;
`;

const DurationText = styled.Text`
  margin-left: 10px;
  margin-top: 5px;
  font-family: "Montserrat_500Medium";
  color: #666;
  font-size: 14px;
`;

const Titulo = styled.Text`
  font-family: "Montserrat_700Bold";
  color: #222022;
  font-size: 22px;
  max-width: 80%;
`;

const Descrição = styled.Text`
  margin-top: 10px;
  font-family: "Montserrat_500Medium";
  max-width: 85%;
  color: #666;
  font-size: 14px;
`;

const Border = styled.View`
  width: 90%;
  margin-top: 15px;
  margin-left: 20px;
  height: 1px;
  background: #6666667a;
`;

const RelatedVideosContainer = styled(ScrollView)`
  flex-direction: row;
  margin-left: 20px;
  margin-top: 30px;
`;

const RelatedVideoCard = styled.View`
  flex-direction: column;
  margin-bottom: 20px;
  margin-right: 20px;
  align-items: center;
`;

const RelatedThumbnail = styled.Image`
  width: 250px;
  height: 140px;
  border-radius: 15px;
  margin-bottom: 10px;
`;

const RelatedTextDiv = styled.View`
  justify-content: center;
  flex-direction: column;
  width: 250px;
`;

const RelatedTitle = styled.Text`
  font-family: "Montserrat_600SemiBold";
  color: #222022;
  font-size: 16px;
  width: 100%;
  max-width: 80%;
  flex-shrink: 1;
`;

const RelatedDescrição = styled.Text`
  color: #666;
  font-family: "Montserrat_500Medium";
  margin: 5px 0px;
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

const VideoDate = styled.Text`
  margin-left: 5px;
  font-size: 14px;
  color: #8E7A62;
  font-family: "Montserrat_600SemiBold";
`;

const NavegaçãoDest = styled.View`
  position: relative;
  bottom: 0px;
  background: #fff;
  justify-content: center;
  width: 100%;
  height: 100px;
`;

const ButtonDest = styled.View`
  width: 90%;
  height: 60px;
  background: #8E7A62;
  justify-content: center;
  align-items: center;
  margin-left: 20px;
  border-radius: 50px;
`;

const TextDest = styled.Text`
  font-family: "Montserrat_600SemiBold";
  font-size: 14px;
  color: #fff;
`;

