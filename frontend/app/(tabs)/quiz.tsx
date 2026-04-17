import { StyleSheet, Text, View } from "react-native";
import { useState, useCallback} from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import IconAction from "@/components/IconAction";
import { UserData } from "@/shared/types";
import { useAuthStore } from "@/utils/authStore";

type Local = {
  id: string;
  groupName : string,
  users?: string;
  choosenOneUserID: string;
};

export default function Quiz() {
  const {id, groupName, users, choosenOneUserID} = useLocalSearchParams<Local>();
  const { appToken, userInfo } = useAuthStore();
  let isChoosen = false;
  
  const usersGroup: UserData[] = users ? JSON.parse(users) : [];
  const choosenOneGroup: UserData[] = choosenOneUserID ? JSON.parse(choosenOneUserID) : [];

  if(userInfo == null) {
    throw "userInfo null"
  } else {
    isChoosen = (userInfo.id == Number(id));
  }
  

  const router = useRouter()

  const handleQuitQuiz = () => {
    router.back()
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>C'est l'heure!!</Text>
          {
            ((isChoosen &&
              <Text style={styles.title}>Le quizz de l'élu</Text>
            ) || 
            (!isChoosen &&
              <Text style={styles.title}>Le quizz du peuple</Text>
            ))
          }
          <IconAction 
            img="close" 
            OnValidation={handleQuitQuiz}
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