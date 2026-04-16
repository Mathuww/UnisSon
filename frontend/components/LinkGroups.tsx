import { Link } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from "react-native";


type Props = {
    label: string;
    id:number;

};

const { width } = Dimensions.get('window');

export default function LinkGroups({id, label} : Props) {
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
        <View style={[styles.container, {backgroundColor: bgColor}]}> 
            <Link 
                href={{
                    pathname: "./(tabs)/group",
                    params: {id:id}
                }}
                style={styles.linkLabel}>
                    {label}
            </Link>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 160,
        marginTop: 20,
        alignSelf: "center",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 44,
        width: "80%",
        paddingHorizontal: "10%",

    },
    linkLabel: {
        color: "#ffffff",
        fontSize: width > 800 ? 44 : 32,
        textAlign: "center"
    },
});

