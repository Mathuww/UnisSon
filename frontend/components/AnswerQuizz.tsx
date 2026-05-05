import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text } from "react-native";

type Props = {
    id:number;
    label: string;
    goodAnswer: boolean;
    touchID:number;
    OnPress:(id:number) => void;
};

const { width } = Dimensions.get('window');

export default function QuizAnswer({ id, label, goodAnswer, touchID, OnPress}: Props) {
    let color = "#56606B";

    if (touchID > -1 ) {
        if(goodAnswer) {
            color = "#e76f51"
        } else if (touchID == id) {
            color = "#9F0606";
        }
    }

    return (
        <Pressable android_disableSound={true} style={[styles.container, { backgroundColor: color }]} onPress={OnPress}>
            <Text style={styles.label}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 100,
        margin: 8,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    label: {
        color: "#ffffff",
        fontSize: width > 800 ? 44 : 20,
        textAlign: "center",
    },
});