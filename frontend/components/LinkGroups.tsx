import {useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text } from "react-native";
import { Badge } from "@react-navigation/elements";

type Props = {
    label: string;
    id:number;
    hasNotification:boolean;
    notifText:string | null;
};

const { width } = Dimensions.get('window');

export default function LinkGroups({id, label, hasNotification, notifText} : Props) {
    const [bgColor, setBgColor] = useState('#4E6E5D');
    const loading = useRef(false);

    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            loading.current = false;
        }, [])
    );

    useEffect(() => {
            console.log("Creating link group for " + id)
        }, [id]);

    const handleDestinationGroup = (id: number) => {
        if (loading.current) {
            return;
        }
        loading.current = true;
        router.push({
            pathname: `/(tabs)/tempindex/group/${id}` as any,
        });
    };

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
        <Pressable style={[styles.container, { backgroundColor: bgColor }]} onPress={() => handleDestinationGroup(id)}>
            <Text style={styles.linkLabel}>
                {label}
            </Text>
            {notifText && <Text>{notifText}</Text>}
            {hasNotification && (<Badge style={styles.badge} size={50} visible={true}></Badge>)}
        </Pressable>
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
    badge : {
        position: 'absolute',
        top : 20,
        right : 20,
        borderWidth: 2,
        backgroundColor: '#f32f24',
    }
});

