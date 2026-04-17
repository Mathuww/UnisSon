import { UserData } from "@/shared/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import CopiedInput from "@/components/CopiedInput";
import IconAction from "@/components/IconAction";


type Local = {
  id: string;
  groupName : string,
  users?: string;
};

export default function Invitation() {
  const {id, groupName, users} = useLocalSearchParams<Local>();

  const usersGroup: UserData[] = users ? JSON.parse(users) : [];

  const router = useRouter()

  const handleQuitInvite = () => {
    router.back()
  }


  return (
      <View style={styles.container}>
        <Text style={styles.title}>Heyy, c'est bientôt l'heure d'avoir une communauté à toi :)</Text>
        <Text style={styles.subtitle}>Pour rappel, les membres de {groupName} sont :</Text>
        <FlatList
          data={usersGroup}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => <Text style={styles.text}>-{item.nickname}</Text>
          }
        />
        <Text style={styles.subtitle}>Si vous voulez agrandir votre communauté, voici l'unique anneau à partager :</Text>
        <View style={styles.sharedButton}>
          <CopiedInput url="unisson.qbert.fr"/>
        </View>
        <IconAction 
          img="close" 
          OnValidation={handleQuitInvite}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,

  }, 
  title: {
    padding : 5,
    color: "#fff",
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom : 20,
  },
  subtitle: {
    padding : 5,
    color: "#ffe",
    fontSize : 16,
    paddingBottom : 5,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    paddingLeft : 11,
  },
  sharedButton: {
    marginBottom: 50,
  }
});