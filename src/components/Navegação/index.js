import React from "react";
import { useNavigation } from "@react-navigation/native";
import styled from "styled-components/native";

const NavigationBar = () => {
    const navigation = useNavigation();
    return (
        <Main>

        </Main>
    );
};

export default NavigationBar;

const Main = styled.View`
    /* position: absolute;
    bottom: 0px;
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
    background: #fff;
    width: 100%;
    height: 70px; */
`;

const BoxNav = styled.View`
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;