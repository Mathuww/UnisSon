import { ApiCall } from "@/api/BackendApi";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import UnissonButton from "@/components/UnissonButton";


type LocalParams = {
  id: string;
};

//Pour débugger avant l'arrivée du backend
type GroupState = "startSunday" | "finishSunday" | "startWeek" | "finishWeek" | "startSaturday" | "finishSaturday";


export default function Group() {
  //Pour débugger avant l'arrivée du backend
  const [groupState, setGroupState] = useState<GroupState>("startSunday");

  const {id} = useLocalSearchParams<LocalParams>();

  const [test, setTest] = useState<{id: number, nickname: string}[]>([]);
  useEffect(() => {
    ApiCall.groups.getGroupData(1, parseInt(id, 10))
    .then(reponse => {
      setTest(reponse.data);
    })
    .catch(err => {
      console.error(err);
    });
  }, [id]);



  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>
          Les casquettes
        </Text>
        <View style={styles.container}>
          <FlatList
                  data={test}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({item}) => <Text style={styles.text}>{item.nickname}</Text>
                  }
                />
        </View>
        <View style={styles.containerButton}>
          {groupState == "startSunday" && (
            <UnissonButton
              label="À vous d'être à la hauteur d'un élu d'Unisson"
              colorText="#e76f51"
              //Pour débugger avant l'arrivée du backend
              OnValidation={() => setGroupState("finishSunday")}
            />
          )}
          {groupState == "startWeek" && (
            <UnissonButton
              label="À vous d'impressionner votre élu avec votre musique !"
              colorText="#e76f51"
              //Pour débugger avant l'arrivée du backend
              OnValidation={() => setGroupState("finishWeek")}
            />
          )}
          {groupState == "startSaturday" && (
            <UnissonButton
              label="Qui connaît mieux l'élu ?"
              colorText="#e76f51"
              //Pour débugger avant l'arrivée du backend
              OnValidation={() => setGroupState("finishSaturday")}
            />
          )}
          <UnissonButton
              //Pour débugger avant l'arrivée du backend
              label="Passer à l'état suivant"
              colorText="#2a9d8f"
              OnValidation=
                {(groupState == "finishSunday" &&
                (() => setGroupState("startWeek"))) ||
                (groupState == "finishWeek" &&
                (() => setGroupState("startSaturday"))) ||
                (groupState == "finishSaturday" &&
                (() => setGroupState("startSunday"))) ||
                (() => {})
              }
            />
        </View>
      </View>

    </>
  );
}



const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,
    paddingTop: 20,
  },
  containerButton:{
    paddingBottom: 30,
    gap: 22,
  },
  title: {
    color: "#fff",
    alignSelf: "center",
    fontSize: 32,
    fontWeight: "bold",
  },
  text: {
    color: "#fff"
  }
})
