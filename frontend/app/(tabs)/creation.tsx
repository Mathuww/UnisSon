import { ApiCall } from "@/api/BackendApi";
import { useRouter, useFocusEffect } from 'expo-router';
import {useCallback, useState } from "react";
import {StyleSheet, View, Text, TextInput} from "react-native";
import UnissonTextInput from "@/components/UnissonTextInput";
import NumberSlider from "@/components/NumberSlider";
import UnissonButton from "@/components/UnissonButton";
import { useGroupStore } from "@/utils/groupStore";
import { ActionResult } from "@/shared/types";
import { useAuthStore } from "@/utils/authStore";




export default function Creation() {
  const [groupName, setGroupName] = useState('');
  const [groupMaxUser, setGroupMaxUser] = useState(4);

  const router = useRouter();

  const {appToken} = useAuthStore();

  const createGroup = useGroupStore((state) => state.createGroup);

  const resetInput = useCallback(() => {
    setGroupName("");
    setGroupMaxUser(4);
  }, []);

  useFocusEffect(
    resetInput
  );

  const handleCreateGroup = async () => {
    if (!appToken) {
      console.error("Not logged in");
      return;
    }
    console.log(groupName, groupMaxUser);
    try {
      if(groupName == "") {
        throw new Error("Nom du groupe incorrect (vide)");
      }

      const result: ActionResult = await createGroup(appToken, groupName, groupMaxUser);

      if (result.success) {
        router.push({ pathname: '/(tabs)/group', params: {id: result.groupID}});
      } else {
        throw new Error(String(result.error));
      }
    } catch (error) {
      console.error("On ne peut pas créer ce groupe. Veuillez réessayer! \n" + error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Heyy, à toi de créer ton propre univers avec tes musiciens, compositeurs, producteurs, podcasteurs, ainsi que nos invités d'honneurs Stephane Jeannin vs Gaïa</Text>
      <Text style={styles.subtitle}>Mais avant tout, je te demandes quelques tatonnements :</Text>
      <UnissonTextInput labelDefault="Nom du groupe" text={groupName} OnWrite={setGroupName}></UnissonTextInput>
      <NumberSlider numberDefault={4} min={2} max={11} numberActual={groupMaxUser} OnSlice={setGroupMaxUser}></NumberSlider>
      <UnissonButton label="Explosion d'un nouveau univers" colorText="#e76f51" OnValidation={handleCreateGroup}></UnissonButton>
    </View>  
  );
}



const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25292e',
    flex: 1,
    paddingTop: 20,
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
    fontSize : 12,
    paddingBottom : 5,
  },
})
