import { StyleSheet, Text, View } from "react-native";
import IconLink from "@/components/IconLink";

export default function Profile() {
    return (
        <View style={styles.container}>
            <Text style={styles.pseudo}>@Mathuww</Text>
            <View style={styles.containerIcons}>
              <IconLink 
                img="logout" 
                pageRef="/+not-found"
                OnValidation={() => {}}
              />
              <IconLink 
                img="notification-add" 
                pageRef="/(tabs)/invitation"
                OnValidation={() => {}}
              />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
    containerIcons: {
      width: "50%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
  },
    pseudo: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    alignSelf: "flex-start",
    paddingTop: 30,
    paddingHorizontal: 20,
  }
});