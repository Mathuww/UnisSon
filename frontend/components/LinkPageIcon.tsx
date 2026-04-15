import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from "react-native";


type Props = {
    //icon: keyof typeof MaterialIcons.glyphMap;
    label: string;

};

const { width } = Dimensions.get('window');

export default function LinkPageIcon({label} : Props) {
    return (
        <View style={styles.container}> 
            <Link 
                href={{
                    pathname: "./(tabs)/creation"
                }}
                style={styles.linkLabel}>
                    {label}
            </Link>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        alignSelf: "center",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 44,
        width: "80%",
        paddingHorizontal: "10%",

    },
    linkLabel: {
        color: '#ffffff',
        fontSize: width > 800 ? 44 : 32,
        textAlign: "center"
    },
});

