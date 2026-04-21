import { StyleSheet, Text, View } from "react-native";

export default function Invitation() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Attente de la version MVP</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
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