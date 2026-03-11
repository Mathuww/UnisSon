import { Image } from "expo-image";
import { ImageSourcePropType, StyleSheet, TranslateXTransform, TranslateYTransform, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type Props = {
    imageSize: number;
    stickerSource: ImageSourcePropType;
};

export default function EmojiSticker({imageSize, stickerSource}: Props) {
    const scaleImage = useSharedValue(imageSize);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const imageStyle = useAnimatedStyle(() => {
        return {
            width: withSpring(scaleImage.value),
            height: withSpring(scaleImage.value)
        }
    })

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            const scaleFactor = 2.45;
            if (scaleImage.value !== imageSize * scaleFactor) {
                scaleImage.value = scaleImage.value * scaleFactor;
            } else {
                scaleImage.value = Math.round(scaleImage.value / scaleFactor);
            }
        });

    const containerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: translateX.value
                },
                {
                    translateY: translateY.value
                }
            ]
        }
    });

    const dragQueen = Gesture.Pan()
        .onChange(event => {
            translateX.value += event.changeX;
            translateY.value += event.changeY;
        });

    return (
        <GestureDetector gesture={dragQueen}>
            <Animated.View style={[containerStyle, styles.container]}>
                <GestureDetector gesture={doubleTap}>
                    <Animated.Image source={stickerSource} resizeMode="contain"
                    style={[imageStyle, {width: imageSize, height: imageSize}]} />
                </GestureDetector>
            </Animated.View>
        </GestureDetector>
    )
}

const styles = StyleSheet.create({
    container: {
        top: -350
    }
});