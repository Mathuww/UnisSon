import { UserData } from "@/shared/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import CopiedInput from "@/components/CopiedInput";
import IconAction from "@/components/IconAction";
import {useEffect, useState} from "react";
import {useGroupStore} from "@/utils/groupStore";

/**
 * Page de création d'un lien d'invitation pour un groupe
 */
export default function Invitation() {
  const {id} = useLocalSearchParams();
  const router = useRouter();
  const [inviteLink, setInviteLink] = useState<string>("");
  const {createInvite, getGroup} = useGroupStore();
  const [groupName, setGroupName] = useState<string>("");
  const [usersGroup, setUsersGroup] = useState<UserData[]>([]);

  /**
   * Load les données du groupe pour préparer le lien d'invitation 
   */
  useEffect(() => {
      const loadGroupData = async () => {
          const group = await getGroup(Number(id));
          if (group && group.users) {
              setGroupName(group.name);
              setUsersGroup(group.users);
          }
        };
        loadGroupData();
    })

  /**
   *    
   */ 
  useEffect(() => {
    (async () => {
        const result = await createInvite(Number(id));
        if (result.success && result.data) {
          console.log("setting invite link to ", result.data);
          setInviteLink(result.data);
        }
    })();
  }, [createInvite, id]);

  const handleQuitInvite = () => {
    router.back()
  }


  return (
      <View style={styles.container}>
        <Text style={styles.title}>Hey, c'est bientôt l'heure d'avoir une communauté à toi :)</Text>
        <Text style={styles.subtitle}>Pour rappel, les membres de {groupName} sont :</Text>
        <FlatList
          data={usersGroup}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => <Text style={styles.text}>-{item.nickname}</Text>
          }
        />
        <Text style={styles.subtitle}>Si vous voulez agrandir votre communauté, voici l&#39;unique anneau à partager :</Text>
        <View style={styles.sharedButton}>
          <CopiedInput url={inviteLink}/>
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
    paddingTop: 100,
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