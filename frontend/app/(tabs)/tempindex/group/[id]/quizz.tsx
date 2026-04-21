import { StyleSheet, Text, View } from "react-native";
import {useState, useCallback, useEffect} from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import IconAction from "@/components/IconAction";
import { useAuthStore } from "@/utils/authStore";
import {useGroupStore} from "@/utils/groupStore";

export default function Quiz() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const {getGroup} = useGroupStore(); /* Note : utilise ça pour récupérer les infos utilisateurs */
  const {userInfo} = useAuthStore();

  const [chosenOne, setChosenOne] = useState<number | null>(null);
  const [isChosen, setIsChosen] = useState<boolean>(false);

  useEffect(() => {
    const loadGroupData = async () => {
      const group = await getGroup(Number(id));
      if (group && group.chosenOneUserID) {
        setChosenOne(group.chosenOneUserID);
      }
    };
    loadGroupData();
  })

  useEffect(() => {
    if (userInfo) {
      setIsChosen(chosenOne === Number(userInfo.id));
    }
  }, [chosenOne, userInfo]);


  const handleQuitQuiz = () => {
    router.back()
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>C'est l'heure!!</Text>
          {
            ((isChosen &&
              <Text style={styles.title}>Le quiz de l'élu</Text>
            ) ||
            (!isChosen &&
              <Text style={styles.title}>Le quiz du peuple</Text>
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