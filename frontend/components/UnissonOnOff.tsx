import { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

type Props = {
  value: boolean;
  OnValidation: (value: boolean) => void;
}

export default function UnissonOnOff({ value, OnValidation }: Props) {
  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handlePress = () => {
    const newValue = !value;
    Animated.timing(animation, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    OnValidation(newValue);
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ccc", "#e76f51"],
  });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.background, { backgroundColor }]}>
        <Animated.View style={[styles.vehicule, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  background: {
    width: 52,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    padding: 3,
  },
  vehicule: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
});