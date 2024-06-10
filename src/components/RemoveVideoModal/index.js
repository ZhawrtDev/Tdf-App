import React, { useState, useRef } from 'react';
import { Modal, TouchableOpacity, Text, View, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';

const RemoveVideoModal = ({ modalVisible, setModalVisible, videoToRemove, handleRemoveVideo }) => {
  const [offsetY, setOffsetY] = useState(0);
  const scrollMainRef = useRef(null);
  const modalHeight = 400;
  const minimumSlideDistance = 50;

  const handlePanResponderMove = (_, gestureState) => {
    const deltaY = gestureState.moveY - gestureState.y0;
    if (deltaY > 0) {
      setOffsetY(deltaY);
    }
  };

  const handleCloseModal = () => {
    if (offsetY === 0) {
      setModalVisible(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setOffsetY(0);
  };

  const handlePanResponderRelease = () => {
    if (offsetY > minimumSlideDistance) {
      setModalVisible(false);
    }
    setOffsetY(0);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCloseModal}
    >
      <ModalContainer {...{ offsetY, modalHeight }} onStartShouldSetResponder={() => true}>
        <ModalView style={{ transform: [{ translateY: Math.min(offsetY, modalHeight) }] }}>
          <ScrollViewMain
            style={{ transform: [{ translateY: Math.min(offsetY, modalHeight) }] }}
            ref={scrollMainRef}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderMove={handlePanResponderMove}
            onResponderRelease={handlePanResponderRelease}
          >
            <ScrollModal />
          </ScrollViewMain>
          <ModalText>Remover dos Favoritos?</ModalText>
          {videoToRemove && (
            <VideoModal>
              <VideoThumbnail source={{ uri: videoToRemove.thumbnail }} />
              <VideoInfoModal>
                <VideoTitle numberOfLines={1}>{videoToRemove.title}</VideoTitle>
                <VideoDescription numberOfLines={2}>{videoToRemove.description}</VideoDescription>
                <Information>
                  <DivInformation>
                    <MaterialIcons name="date-range" size={15} color="#8E7A62" />
                    <VideoDate>{new Date(videoToRemove.date).toLocaleDateString()}</VideoDate>
                  </DivInformation>
                </Information>
              </VideoInfoModal>
            </VideoModal>
          )}
          <ButtonContainer>
            <CancelButton onPress={handleModalClose}>
              <ButtonText>Cancelar</ButtonText>
            </CancelButton>
            <RemoveButton onPress={handleRemoveVideo}>
              <ButtonText>Remover</ButtonText>
            </RemoveButton>
          </ButtonContainer>
        </ModalView>
      </ModalContainer>
    </Modal>
  );
};

export default RemoveVideoModal;

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

const ScrollViewMain = styled.View`
  position: absolute;
  align-items: center;
  width: 100%;
  height: 50px;
`;

const ScrollModal = styled.View`
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

const VideoModal = styled.View`
  margin-top: 10px;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const VideoThumbnail = styled.Image`
  width: 180px;
  height: 100px;
  margin-right: 10px;
  border-radius: 20px;
`;

const VideoInfoModal = styled.View`
  position: relative;
  left: 0px;
  margin-top: 0px;
  width: 150px;
  margin-left: 5px;
`;

const VideoTitle = styled.Text`
  font-size: 16px;
  font-family: "Montserrat_700Bold";
  color: #222022;
`;

const VideoDescription = styled.Text`
  font-size: 12px;
  color: #666;
  font-family: "Montserrat_600SemiBold";
  margin: 10px 0px;
`;

const VideoDate = styled.Text`
  margin-left: 5px;
  font-size: 14px;
  color: #8E7A62;
  font-family: "Montserrat_600SemiBold";
`;

const DivInformation = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Information = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-right: 10px;
`;

const ButtonContainer = styled.View`
  position: relative;
  margin-top: 20px;
  flex-direction: row;
  justify-content: space-between;
  width: 95%;
`;

const CancelButton = styled(TouchableOpacity)`
  width: 48%;
  height: 50px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  background: #8e7a622e;
`;

const RemoveButton = styled(TouchableOpacity)`
  width: 48%;
  height: 50px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  background: #8E7A62;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-family: "Montserrat_700Bold";
`;
