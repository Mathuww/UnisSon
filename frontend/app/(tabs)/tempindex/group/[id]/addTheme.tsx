import { StyleSheet, Text, View } from "react-native";
import { useState, useCallback} from "react";
import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import UnissonTextInput from "@/components/UnissonTextInput";
import UnissonButton from "@/components/UnissonButton";
import { useGroupStore } from "@/utils/groupStore";


export default function SubmitTheme() {
  const [groupTheme, setGroupTheme] = useState('');
  const { id } = useLocalSearchParams();
  const {submitTheme} = useGroupStore();

  const router = useRouter();

  const resetInput = useCallback(() => {
      setGroupTheme("");
    }, []);

    useFocusEffect(
      resetInput
    );

    const handleTheme = async () => {
      console.log(groupTheme);
      try {
        await submitTheme(Number(id), groupTheme);

        //En attendant
        router.push({ pathname: `/(tabs)/tempindex/group/${id}/` as any});
      } catch (error) {
        console.error("On n'arrive pas à transmettre votre thème. Veuillez réessayer!");
      }
   }


    return (
        <View style={styles.container}>
            <Text style={styles.title}>L'élu de cette semaine est vous !!</Text>
            <UnissonTextInput labelDefault="Votre thème musicale" text={groupTheme} OnWrite={setGroupTheme}/>
            <UnissonButton label="Définition d'une nouvelle ère" colorText="#e76f51" OnValidation={handleTheme}></UnissonButton>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,
    justifyContent: "center",
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