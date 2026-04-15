import { Button } from "@react-navigation/elements";
import { StyleSheet, Text, View } from "react-native";
import LinkPageIcon from "@/components/LinkPageIcon";

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Page de profil</Text>
            <LinkPageIcon label={"Se déconnecter"}></LinkPageIcon>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25292e',
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    color: '#fff'
  }
})
