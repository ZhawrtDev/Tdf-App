import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Octicons, Ionicons } from '@expo/vector-icons';

const apiKey = "AIzaSyDv3Jw2tgELQZacjV2YQr5vdFMKHvz3Czo";
const channelId = "UCJ1RTO5MjmLlgI5rlEEqCiA";

export default () => {
    const navigation = useNavigation();
    const [channelData, setChannelData] = useState(null);

    useEffect(() => {
        fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    setChannelData(data.items[0].snippet);
                }
            })
            .catch(error => console.error("Error fetching channel data:", error));
    }, []);

    const handleNavigationInicio = () => {
        navigation.navigate("SavedVideos");
    };

    const handleNavigationNotificação = () => {
        // navigation.navigate("Search");
    };

    const handleNavigationSearch = () => {
        navigation.navigate("Search");
    };

    return (
        <Main>
            <FirstMain>
                <FirstContent>
                    <TouchableOpacity onPress={handleNavigationInicio}>
                        {channelData && channelData.thumbnails && (
                            <Image
                                source={{ uri: channelData.thumbnails.default.url }}
                                style={{
                                    borderRadius: 50,
                                    width: 50,
                                    height: 50
                                }}
                            />
                        )}
                    </TouchableOpacity >
                    <ContentText>
                        <BoasVindas>Bem Vindo 👋</BoasVindas>
                        <CanalNome>Tabernáculo Da Fé</CanalNome>
                    </ContentText>
                </FirstContent>

                <TouchableOpacity onPress={handleNavigationNotificação}>
                    <IconMain>
                        <Octicons name="bell" size={20} color="#302E30" />
                        <BallRed></BallRed>
                    </IconMain>
                </TouchableOpacity>
            </FirstMain>

            <TouchableOpacity onPress={handleNavigationSearch}>
                <Search style={{ borderRadius: 15 }}>
                    <SearchContent>
                        <Ionicons name="search-outline" size={20} color="#D1CDD1" />
                        <SearchText>Procure reflexão do dia..</SearchText>
                        <Filter>
                            <TouchableOpacity>
                                <Ionicons name="git-commit-outline" size={24} color="#7d715f" />
                            </TouchableOpacity>
                        </Filter>
                    </SearchContent>
                </Search>
            </TouchableOpacity>

            <SubNavApr>
                <NomedContent>Reflexão</NomedContent>
                <TouchableOpacity>
                    <VerMais>Ver todos</VerMais>
                </TouchableOpacity>
            </SubNavApr>
        </Main>
    );
}

const Main = styled.View`
    width: 95%;
    margin-left: 20px;
    margin-top: 40px;
    flex-direction: column;
`;

const FirstMain = styled.View`
    flex-direction: row;
    justify-content: space-between;
    padding-right: 20px;
`;

const FirstContent = styled.View`
    flex-direction: row;
`;

const ContentText = styled.View`
    margin-left: 10px;
    flex-direction: column;
`;

const BoasVindas = styled.Text`
    font-family: "Montserrat_500Medium";
    color: #666;
    margin-bottom: -5px;
`;

const CanalNome = styled.Text`
    color: #2E2C2D;
    font-size: 20px;
    font-family: "Poppins_700Bold";
    margin-top: 5px;
`;

const IconMain = styled.View`
    background: #fff;
    width: 50px;
    height: 50px;
    border-radius: 50px;
    justify-content: center;
    align-items: center;
    border: 1px solid #F2F2F2;
`;

const BallRed = styled.View`
    position: absolute;
    top: 10px;
    right: 10px;
    width: 8px;
    height: 8px;
    background: #F25F29;
    border-radius: 50px;
`;

const Search = styled.View`
    margin-top: 20px;
    background: #F2F2F2;
    width: 95%;
    height: 50px;
    flex-direction: row;
`;

const SearchContent = styled.View`
    position: relative;
    width: 100%;
    height: 100%;
    align-items: center;
    margin-left: 20px;
    flex-direction: row;
`;

const SearchText = styled.Text`
    font-family: "Poppins_500Medium";
    margin-left: 5px;
    color: #D1CDD1;
    font-size: 14px;
`;

const Filter = styled.View`
    position: absolute;
    right: 30px;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 80%;
`;

const SubNavApr = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 95%;
    margin-top: 20px;
    margin-bottom: 10px;
`;

const NomedContent = styled.Text`
    font-size: 18px;
    font-family: "Poppins_700Bold";
    color: #222022;
`;

const VerMais = styled.Text`
    font-size: 18px;
    color: #8E7A62;
    font-family: "Montserrat_600SemiBold"
`;