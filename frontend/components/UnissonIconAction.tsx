import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Href } from "expo-router";

import { Image, Pressable, StyleSheet } from "react-native";

type Props = {
  img?: keyof typeof MaterialIcons.glyphMap;
  source?:{uri : string};
  OnValidation: () => void;
}

export default function UnissonIconAction({ img, source, OnValidation }: Props) {
  const isAsset = (source) ? true : false;
  return (
    <Pressable style={styles.iconButton} onPress={OnValidation}>
      {(isAsset && (
          <Image source={source}/>
        )) || (
          <MaterialIcons name={img} size={30} color="white" />
      )}
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