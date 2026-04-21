import { StyleSheet, Text, View } from "react-native";

export default function Ranking() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Votre classement</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,
    justifyContent: "center",
    paddingTop: 100,
  }, title: {
    padding : 5,
    color: "#fff",
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom : 20,
  },
});