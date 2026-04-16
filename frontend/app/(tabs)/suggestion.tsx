import { StyleSheet, Text, View } from "react-native";
import { useState, useCallback} from "react";
import { useFocusEffect, useRouter } from "expo-router";
import UnissonTextInput from "@/components/UnissonTextInput";
import UnissonButton from "@/components/UnissonButton";


export default function Suggestion() {
  const [yourSuggestion, setYourSuggestion] = useState('');

  const router = useRouter();

  const resetInput = useCallback(() => {
      setYourSuggestion("");
    }, []);
  
    useFocusEffect(
      resetInput
    );

    const handleSuggestion = async () => {
    console.log(yourSuggestion);
    try {
      /*
      Appel au Backend
      GAIA IT IS YOUR JOB
      */

      //En attendant
      router.push({ pathname: '/(tabs)/group'/*, params: { id: .id }*/ });
    } catch (error) {
      alert("On n'arrive pas à transmettre votre suggestion musicale. Veuillez réessayer!");
    }
  }


    return (
        <View style={styles.container}>
            <Text style={styles.title}>
              À vous de tenir tête à vos camarades en ayant la meilleure suggestion musicale de votre groupe.
            </Text>
            <Text style={styles.subtitle}>
              Par ailleurs, n'oubliez pas que la suggestion doit être personnalisée à l'élu et à son thème :)
            </Text>
            <UnissonTextInput labelDefault="Le lien de votre suggestion musicale" text={yourSuggestion} OnWrite={setYourSuggestion}/>
            <UnissonButton label="Définition d'une nouvelle ère" colorText="#e76f51" OnValidation={handleSuggestion}></UnissonButton>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#25292e",
    flex: 1,
    justifyContent: "center",
  }, title: {
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
});