import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Href } from "expo-router";

import { Pressable, StyleSheet } from "react-native";

type Props = {
  img: keyof typeof MaterialIcons.glyphMap;
  pageRef: Href;
}

export default function IconLink({ img, pageRef }: Props) {
  return (
    <Link href={pageRef} replace asChild>
      <Pressable style={styles.iconButton}>
        <MaterialIcons name={img} size={30} color="white" />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    margin: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});