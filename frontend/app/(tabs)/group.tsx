import { ApiCall } from "@/api/BackendApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/utils/authStore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import UnissonButton from "@/components/UnissonButton";
import IconLink from "@/components/IconLink";


type Local = {
  id: string;
};

//Pour débugger avant l'arrivée du backend
type GroupState = "startSunday" | "finishSunday" | "startWeek" | "finishWeek" | "startSaturday" | "finishSaturday";


export default function Group() {
  //Pour débugger avant l'arrivée du backend
  const [groupState, setGroupState] = useState<GroupState>("startSunday");

  const {id} = useLocalSearchParams<Local>();

  const router = useRouter();

  const {appToken} = useAuthStore();

  //Débuguer en attente du backend
  const [choosenState, setChoosenState] = useState(true);
  const choosenName = "Pablo";
  

  const [groupData, setGroupData] = useState<{id: number, nickname: string}[]>([]);
  useEffect(() => {
    if(!appToken) {
      return
    } 
    ApiCall.groups.getGroupData(appToken, parseInt(id, 10))
    .then(reponse => {
      setGroupData(reponse.data.data);
    })
    .catch(err => {
      console.error(err);
    });
  }, [id]);

  const handleChoosenTheme = async () => {
    try {
      /*
      Appel au Backend
      GAIA IT IS YOUR JOB
      */

      //En attendant
      setGroupState("finishSunday")
      router.push({ pathname: '/(tabs)/choosenTheme'/*, params: { id: .id }*/ });
    } catch (error) {
      console.error("On ne pas accèder à ta page de sélection de ton thème en tant qu'élu!");
    }
  }

  const handleSuggestion = async () => {
    try {
      /*
      Appel au Backend
      GAIA IT IS YOUR JOB
      */

      //En attendant
      setGroupState("finishWeek")
      router.push({ pathname: '/(tabs)/suggestion'/*, params: { id: .id }*/ });
    } catch (error) {
      console.error("On ne pas accèder à la page de proposition de ta dernière suggestion!");
    }
  }

  const handleQuiz = async () => {
    try {
      /*
      Appel au Backend
      GAIA IT IS YOUR JOB
      */

      //En attendant
      setGroupState("finishSaturday")
      router.push({ pathname: '/(tabs)/quiz', params: { choosenState: String(choosenState) } });
    } catch (error) {
      console.error("On ne pas accèder à la page de quiz de la semaine!");
    }
  }
  
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>
          Les casquettes
        </Text>
        <View style={styles.container}>
          <FlatList
                  data={groupData}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({item}) => <Text style={styles.text}>{item.nickname}</Text>
                  }
                />
        </View>
        <View style={styles.containerButton}>
          {(groupState === "startSunday") && ((choosenState === true) && (
            <View>
              <Text style={styles.subtitle}>
                Toc Toc, Unisson vous informe que vous allez cartonner cette semaine car vous êtes maintenant élu :)
              </Text>
              <UnissonButton
                label="À vous d'être à la hauteur d'un élu d'Unisson"
                colorText="#e76f51"
                //Pour débugger avant l'arrivée du backend
                OnValidation={handleChoosenTheme}
              />
            </View>
            ) || ((choosenState === false) && (
              <Text style={styles.subtitle}>
                Cette semaine, ce ne sera pas vous l'élu. À vous d'épater musicalement {choosenName} :)
              </Text>
            )
          ))}
          {(groupState === "startWeek") && ((choosenState === false) && (
            <UnissonButton
              label="À vous d'impressionner votre élu avec votre musique !"
              colorText="#e76f51"
              //Pour débugger avant l'arrivée du backend
              OnValidation={handleSuggestion}
            />
            ) || ((choosenState === true) && (
              <Text style={styles.subtitle}>
                Attendez tranquillement que vos amis choississent bien leurs chansons :)
              </Text>
            )
          ))}
          {groupState === "startSaturday" && (
            <UnissonButton
              label="Qui connaît mieux l'élu ?"
              colorText="#e76f51"
              //Pour débugger avant l'arrivée du backend
              OnValidation={handleQuiz}
            />
          )}
          <View style={styles.containerTest}>
            <UnissonButton
              //Pour débugger avant l'arrivée du backend
              label="Passer à l'état suivant"
              colorText="#2a9d8f"
              OnValidation=
                {(((groupState === "finishSunday") || (groupState === "startSunday" && choosenState === false)) &&
                (() => setGroupState("startWeek"))) ||

                (((groupState === "finishWeek") || (groupState === "startWeek" && choosenState === true)) &&
                (() => setGroupState("startSaturday"))) ||

                (groupState === "finishSaturday" &&
                (() => setGroupState("startSunday"))) ||

                (() => {})
              }
            />
            <UnissonButton
              //Pour débugger avant l'arrivée du backend
              label="Êtes-vous vraiment élu ?"
              colorText="#2a9d8f"
              OnValidation= {
                () => {setChoosenState(!choosenState);}
              }
            />
          </View>
        </View>
        <IconLink 
                img="delete-forever" 
                pageRef="/"
                OnValidation={() => {}}
        />
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
    gap: 72,
  },
  containerTest: {
    gap: 20,
  },
  title: {
    color: "#fff",
    alignSelf: "center",
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    padding : 5,
    color: "#ffe",
    fontSize : 12,
    paddingBottom : 5,
  },
  text: {
    color: "#fff"
  }
})
