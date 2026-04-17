import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Href } from "expo-router";

import { Pressable, StyleSheet } from "react-native";

type Props = {
  img: keyof typeof MaterialIcons.glyphMap;
  OnValidation: () => void;
}

export default function IconAction({ img, OnValidation }: Props) {
  return (
    <Pressable style={styles.iconButton} onPress={OnValidation}>
      <MaterialIcons name={img} size={30} color="white" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    margin: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});