import { StyleSheet, Text, View } from "react-native";
import { useState, useCallback} from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import IconLink from "@/components/IconLink";

type Local = {
  choosenState: string;
};

export default function Quiz() {
  const params = useLocalSearchParams<Local>();
  const choosenState = params.choosenState === "true";

  return (
      <View style={styles.container}>
        <Text style={styles.title}>C'est l'heure!!</Text>
          {
            ((choosenState &&
              <Text style={styles.title}>Le quizz de l'élu</Text>
            ) || 
            (!choosenState &&
              <Text style={styles.title}>Le quizz du peuple</Text>
            ))
          }
          <IconLink 
            img="close" 
            pageRef="/(tabs)/group"
            OnValidation={() => {}}
          />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,
    justifyContent: "space-between",
  }, title: {
    padding : 5,
    color: "#fff",
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom : 20,
  },
});