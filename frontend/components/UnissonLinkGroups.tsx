import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef } from "react";
import { Animated, Dimensions, Image, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

export type NotifType = "track" | "theme" | "ranking" | "quizz" | null;
export type PochetteType = "brown" | "purple" | "pink" | "orange";

type Props = {
    id: number;
    label: string;
    notifText: string;
    notifType?: NotifType;
    pochette?: PochetteType;
    style?: ViewStyle;
};

const width = Dimensions.get("window").width;
const SLIDE_TO = width * 0.41;

const srcPochette: Record<PochetteType, any> = {
    brown: require("@/assets/images/brownPochette.jpg"),
    purple: require("@/assets/images/purplePochette.jpg"),
    pink: require("@/assets/images/pinkPochette.jpg"),
    orange: require("@/assets/images/orangePochette.jpg"),
};

const srcBadge: Record<NonNullable<NotifType>, any> = {
    track: require("@/assets/images/trackBadge.png"),
    theme: require("@/assets/images/themeBadge.png"),
    ranking: require("@/assets/images/rankingBadge.png"),
    quizz: require("@/assets/images/quizBadge.png"),
};

export default function UnissonLinkGroups({ id, label, notifText, notifType = null, pochette = "brown", style }: Props) {
    const loading = useRef(false);
    const router = useRouter();
    const anim = useRef(new Animated.Value(0)).current;

    useFocusEffect(useCallback(() => {
        loading.current = false;
        anim.setValue(-SLIDE_TO);
    }, [anim]));

    const handlePress = () => {
        if (loading.current) return;
        loading.current = true;
        Animated.timing(anim, { toValue: 0, duration: 700, useNativeDriver: true }).start();
        setTimeout(() => router.push({ pathname: `/(tabs)/tempindex/group/${id}` as any }), 1000);
    };

    return (
        <View style={[styles.card, style]}>

            <Animated.Image
                source={require("@/assets/images/disc.png")}
                style={[styles.disc, { transform: [{ translateX: anim }] }]}
                resizeMode="contain"
            />

            <Pressable style={styles.activeArea} onPress={handlePress}>

                <Image
                    source={srcPochette[pochette]}
                    style={styles.pochette}
                    resizeMode="cover"
                />

                <View style={styles.textBlock} pointerEvents="none">
                    <Text style={styles.title} numberOfLines={3}>{label}</Text>
                    <Text style={styles.subtitle}>{notifText}</Text>
                </View>

                {notifType && (
                    <Image
                        source={srcBadge[notifType]}
                        style={styles.badge}
                        resizeMode="contain"
                    />
                )}

            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({

    card: {
        overflow: "visible",
    },

    disc: {
        position: "absolute",
        width: "200%",
        height: "200%",
    },

    activeArea: {
        width: "100%",
        height: "45%",
    },

    pochette: {
        width: width * 0.82,
        height: width * 0.36,
    },

    textBlock: {
        position: "absolute",
        top: "12%",
        left: "6%",
        width: "60%",
        gap: 6,
    },

    title: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: width * 0.066,
        
    },

    subtitle: {
        color: "#fff",
        fontSize: width * 0.04,
    },

    badge: {
        position: "absolute",
        top: "10%",
        right: "5%",
        width: width*0.11,
        height: width*0.11,
    },

});