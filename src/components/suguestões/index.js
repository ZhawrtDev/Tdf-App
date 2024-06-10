import React from 'react';
import styled from "styled-components";
import {  TouchableOpacity } from "react-native";
import ComponentSugestão from '../componentSugestão';

import { FontAwesome5 } from '@expo/vector-icons';

export default () => {
  return (
    <Main>
        <AltNav>
            <Sugestao>Sugestôes <FontAwesome5 name="gripfire" size={20} color="#8E7A62" /> </Sugestao>
            <TouchableOpacity>
                <VerMais>Ver todos</VerMais>
            </TouchableOpacity>
        </AltNav>
        <MainBox>
            <ComponentSugestão />
        </MainBox>
    </Main>
  );
}

const Main = styled.View`
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 20px;
    margin-left: 10px;
    width: 95%;
`;

const AltNav = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 95%;
`;

const Sugestao = styled.Text`
    font-size: 18px;
    color: #232123;
    font-family: "Montserrat_700Bold";
`;

const VerMais = styled.Text`
    font-size: 18px;
    color: #8E7A62;
    font-family: "Montserrat_600SemiBold";
`;

const MainBox = styled.View`
    margin-top: 20px;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    width: 95%;
`;

// const Box = styled.View`
//     border: 2px solid #8E7A62;
//     margin-left: 10px;
//     border-radius: 50px;
//     justify-content: center;
//     align-items: center;
//     padding: 0px 20px;
//     height: 40px;
// `;

// const BoxEspecial = styled.View`
//     background: #8E7A62;
//     margin-left: 10px;
//     border-radius: 50px;
//     justify-content: center;
//     align-items: center;
//     padding: 0px 20px;
//     height: 40px;
// `;

// const TextBoxEspecial = styled.Text`
//     color: #fff;
//     font-size: 15px;
//     font-family: "Roboto_700Bold";
// `;

// const TextBox = styled.Text`
//     color: #8E7A62;
//     font-size: 15px;
//     font-family: "Roboto_700Bold";
// `;