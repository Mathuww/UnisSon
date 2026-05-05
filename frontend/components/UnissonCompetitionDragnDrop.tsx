import {useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity } from "react-native";


type Props = {
    label: string;
    id:number;
    OnPressDragnDrop?: () => void;
    Activate: boolean;  

};

const { width } = Dimensions.get('window');

export default function UnissonCompetitionDragnDrop({id, label, OnPressDragnDrop, Activate} : Props) {
    const [bgColor, setBgColor] = useState('#4E6E5D');
    
    const randomColor = () => {
        let color = "#";
        const possibility = "0123456789abcdef";
        for (let x = 0; x < 6; x++) {
            let index = Math.floor(Math.random() * 16);
            let value = possibility[index];

            color += value;
        }
        return setBgColor(color);
    };

    useEffect(() => randomColor(), []);

    return (
        <TouchableOpacity 
            onLongPress={OnPressDragnDrop} 
            delayLongPress={100}
            style={[styles.container, { backgroundColor: bgColor }]}>
                <Text style={styles.linkLabel}>
                    {label}
                </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        paddingVertical : 20,
        alignSelf: "center",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 44,
        width: "80%",
        paddingHorizontal: "10%",

    },
    linkLabel: {
        color: "#ffffff",
        fontSize: 18,
        textAlign: "center",
        fontWeight: '600',
    },
});

